import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { type Encounter, openmrsFetch, type Order, restBaseUrl, useConfig, type Visit } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Result } from '../types';

export const getPatientLabFindings = async (patientId: string, orderType: string) => {
  const activatedOnOrAfterDate = dayjs().startOf('day').toDate().toISOString();
  const activatedOnOrBeforeDate = dayjs().toDate().toISOString();
  const fulfillerStatus = 'COMPLETED';
  const responseFormat =
    'custom:(encounter:(uuid,display,encounterDatetime,obs:(uuid,display,obsDatetime,value,concept:(uuid,display))))';
  const orderTypeParam = `orderTypes=${orderType}&activatedOnOrAfterDate=${activatedOnOrAfterDate}&activatedOnOrBeforeDate=${activatedOnOrBeforeDate}&isStopped=false&fulfillerStatus=${fulfillerStatus}&v=${responseFormat}`;
  const apiUrl = `${restBaseUrl}/order?${orderTypeParam}&patient=${patientId}`;

  const res = await openmrsFetch<{ results: Array<Result> }>(apiUrl);
  const obs = res?.data?.results?.flatMap((order) => order?.encounter?.obs);
  const display = obs?.map((ob) => ob.display?.replaceAll(',', '-'))?.join(';');
  return display || '--';
};

export const geIpdProcedureDetail = async (patientId: string, config: ConfigObject) => {
  const rep =
    'custom:(encounters:(form:(uuid,display),diagnoses:(uuid,display,certainty,diagnosis:(coded:(uuid,display))),encounterProviders:(uuid,display,provider:(uuid,display)),obs:(uuid,display,obsDatetime,value,concept:(uuid,display))))';
  const url = `${restBaseUrl}/visit?patient=${patientId}&v=${rep}`;
  const response = await openmrsFetch<{ results: Array<Pick<Visit, 'encounters'>> }>(url);
  const recentVisit = response?.data?.results?.[0] ?? null;

  const diagnoses =
    recentVisit?.encounters?.flatMap(
      (encounter) =>
        encounter?.diagnoses?.map((diagnosis) => ({
          id: diagnosis?.diagnosis?.coded?.uuid,
          text: diagnosis?.display,
        })) || [],
    ) || [];

  const ipdProcedureEncounter = recentVisit?.encounters?.find(
    (encounter) => encounter?.form?.uuid === config.ipdProcedureFormUuid,
  );
  const ipdProcedureObs = ipdProcedureEncounter?.obs || [];
  const anaesthetist = ipdProcedureObs.find((ob) => ob?.concept?.uuid === config.theatreExportConcepts.anaesthesistName)
    ?.value as string;
  const surgeon = ipdProcedureObs.find((ob) => ob?.concept?.uuid === config.theatreExportConcepts.surgeonName)
    ?.value as string;
  const assistantOne = ipdProcedureObs.find(
    (ob) => ob?.concept?.uuid === config.theatreExportConcepts.surgeonAsistantOneName,
  )?.value as string;
  const assistantTwo = ipdProcedureObs.find(
    (ob) => ob?.concept?.uuid === config.theatreExportConcepts.surgeonAsistantTwoName,
  )?.value as string;
  const scrubNurse = ipdProcedureObs.find((ob) => ob?.concept?.uuid === config.theatreExportConcepts.scrubNurseName)
    ?.value as string;
  const remarks = ipdProcedureObs.find((ob) => ob?.concept?.uuid === config.theatreExportConcepts.surgeionRemarks)
    ?.value as string;

  return {
    diagnoses:
      diagnoses
        ?.map((d) => d.text)
        .filter(Boolean)
        ?.join(';') || '--',
    anaesthetist,
    surgeon: [surgeon, assistantOne, assistantTwo].filter(Boolean).join(' & ') || '--',
    scrubNurse: scrubNurse || '--',
    remarks: remarks || '--',
  };
};

export const useStandardTheatreList = (patientOrders: Array<{ patientId: string; orders: Array<Result> }> = []) => {
  const key = patientOrders ? ['standardTheatreList', patientOrders] : null;
  const config = useConfig<ConfigObject>();
  const {
    theatreExportConcepts,
    testOrderTypeUuid,
    procedureMinorCategoryConceptUuid,
    procedureMajorCategoryConceptUuid,
  } = config;
  const { t } = useTranslation();
  const { data, error, isLoading } = useSWR(key, async (_: string) => {
    const rows = await Promise.all(
      patientOrders.map(async ({ orders, patientId }) => {
        const patientName = orders?.[0]?.patient?.person?.display || '-';
        const ipNo = orders?.[0]?.patient?.display?.split('-')?.[0] || '-';
        const patientGender =
          orders?.[0]?.patient?.person?.gender === 'M'
            ? t('male', 'Male')
            : orders?.[0]?.patient?.person?.gender === 'F'
              ? t('female', 'Female')
              : '-';
        const patientAge = orders?.[0]?.patient?.person?.age || '-';
        const { diagnoses, anaesthetist, scrubNurse, surgeon, remarks } = await geIpdProcedureDetail(patientId, config);
        const labFindings = await getPatientLabFindings(patientId, testOrderTypeUuid);
        const perOrderDetail = orders?.map((order) => ({
          orderId: order.uuid,
          operation: order?.display || '-',
          operationType:
            (order?.procedures?.[0]?.procedureOrder as unknown as Order)?.category?.uuid ===
            procedureMinorCategoryConceptUuid
              ? t('minorAbr', 'A')
              : (order?.procedures?.[0]?.procedureOrder as unknown as Order)?.category?.uuid ===
                  procedureMajorCategoryConceptUuid
                ? t('majorAbr', 'B')
                : '-',
          remarks: order?.instructions || '-',
          surgeon:
            (order?.procedures?.[0]?.encounters?.[0] as Encounter)?.encounterProviders
              ?.map((provider) => provider?.display?.split(':')?.[0])
              .join(' & ') || '-',
        }));
        return perOrderDetail?.map((detail) => ({
          id: detail.orderId,
          patientName,
          patientUuid: patientId,
          ipNo,
          patientGender,
          patientAge,
          diagnosis: diagnoses,
          operation: detail.operation,
          labFindings: labFindings,
          surgeon: surgeon,
          anesthetist: anaesthetist,
          scrubNurse,
          remarks,
        }));
      }),
    );
    return rows.flat() ?? [];
  });

  return { list: data ?? [], error, isLoading };
};

interface UseLabOrdersParams {
  patient?: string;
  excludeCanceledAndExpired?: boolean;
  excludeDiscontinueOrders?: boolean;
}

const useLabOrdersDefaultParams: UseLabOrdersParams = {
  excludeCanceledAndExpired: true,
  excludeDiscontinueOrders: true,
};

export function useLabOrders(params: Partial<UseLabOrdersParams> = useLabOrdersDefaultParams) {
  const definedParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  const { excludeCanceledAndExpired, excludeDiscontinueOrders } = {
    ...useLabOrdersDefaultParams,
    ...definedParams,
  };
  const activatedOnOrAfterDate = useMemo(() => dayjs().startOf('day').toDate().toISOString(), []);
  const activatedOnOrBeforeDate = useMemo(() => dayjs().toDate().toISOString(), []);
  const fulfillerStatus = 'COMPLETED';

  const { testOrderTypeUuid } = useConfig<ConfigObject>();
  const customRepresentation = `custom:(uuid,orderNumber,patient:(uuid,display,person:(uuid,display,age,birthdate,gender)),concept:(uuid,display),action,careSetting:(uuid,display,description,careSettingType,display),previousOrder,dateActivated,scheduledDate,dateStopped,autoExpireDate,encounter:(uuid,display),orderer:(uuid,display),orderReason,orderReasonNonCoded,orderType:(uuid,display,name,description,conceptClasses,parent),urgency,instructions,commentToFulfiller,display,fulfillerStatus,fulfillerComment,accessionNumber,specimenSource,laterality,clinicalHistory,frequency,numberOfRepeats)`;
  let url = `${restBaseUrl}/order?orderTypes=${testOrderTypeUuid}&v=${customRepresentation}&fulfillerStatus=${fulfillerStatus}&activatedOnOrAfterDate=${activatedOnOrAfterDate}&activatedOnOrBeforeDate=${activatedOnOrBeforeDate}&patient=${params.patient}`;
  url = excludeCanceledAndExpired ? `${url}&excludeCanceledAndExpired=true` : url;
  url = excludeDiscontinueOrders ? `${url}&excludeDiscontinueOrders=true` : url;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: { results: Array<Order> };
  }>(`${url}`, openmrsFetch);

  return {
    labOrders: data?.data?.results ?? [],
    isLoading,
    error,
    mutate,
    isValidating,
  };
}
