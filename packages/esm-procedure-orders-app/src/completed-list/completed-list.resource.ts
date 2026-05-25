import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { type Result } from '../types';
import { ConfigObject } from '../config-schema';

export const getPatientLabFindings = async (patientId: string, orderType: string, concepts: Array<string>) => {
  const activatedOnOrAfterDate = dayjs().startOf('day').toDate().toISOString();
  const activatedOnOrBeforeDate = dayjs().toDate().toISOString();
  const fulfillerStatus = 'COMPLETED';
  const responseFormat =
    'custom:(encounter:(uuid,display,encounterDatetime,obs:(uuid,display,obsDatetime,value,concept:(uuid,display))))';
  const orderTypeParam = `orderTypes=${orderType}&activatedOnOrAfterDate=${activatedOnOrAfterDate}&activatedOnOrBeforeDate=${activatedOnOrBeforeDate}&isStopped=false&fulfillerStatus=${fulfillerStatus}&v=${responseFormat}`;
  const apiUrl = `${restBaseUrl}/order?${orderTypeParam}&patient=${patientId}`;

  const res = await openmrsFetch<{ results: Array<Result> }>(apiUrl);
  const obs = res?.data?.results
    ?.flatMap((order) => order?.encounter?.obs)
    ?.filter((ob) => concepts?.includes(ob?.concept?.uuid));
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

  const ipdProcedureEncounter = recentVisit?.encounters?.find((encounter) => encounter?.form?.uuid === formUuid);
  const ipdProcedureObs = ipdProcedureEncounter?.obs || [];

  return {
    diagnoses:
      diagnoses
        ?.map((d) => d.text)
        .filter(Boolean)
        ?.join(';') || '--',
    anaesthetist,
  };
};
