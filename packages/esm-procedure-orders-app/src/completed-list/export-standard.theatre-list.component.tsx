import React, { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading } from '@carbon/react';
import { showSnackbar, useConfig, useLayoutType, type Encounter, type Order } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Result } from '../types';
import { geIpdProcedureDetail, getPatientLabFindings } from './completed-list.resource';

type ExportStandardTheatreListProps = {
  patientOrders?: Array<{ patientId: string; orders: Array<Result> }>;
  onClose?: () => void;
};

const ExportStandardTheatreList: FC<ExportStandardTheatreListProps> = ({ patientOrders = [], onClose }) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const config = useConfig<ConfigObject>();
  const { procedureMajorCategoryConceptUuid, procedureMinorCategoryConceptUuid, testOrderTypeUuid } = config;
  const responseSize = useLayoutType() === 'tablet' ? 'md' : 'sm';
  const headers = [
    { key: 'patientName', label: t('patientName', 'Patient Name') },
    { key: 'ipNo', label: t('ipNo', 'IP/NO') },
    { key: 'patientGender', label: t('sex', 'Sex') },
    { key: 'patientAge', label: t('age', 'Age') },
    { key: 'diagnosis', label: t('diagnosis', 'Diagnosis') },
    { key: 'operation', label: t('operation', 'Operation') },
    { key: 'labFindings', label: t('labFindingsExport', "Lab Findings: (HB;Platelets;K;CL;CR;LFT'S)") },
    { key: 'surgeon', label: t('surgeon', 'Surgeon & Ass.Surgeon') },
    { key: 'anesthetist', label: t('anesthetist', 'Anesthetist') },
    { key: 'scrubNurse', label: t('scrubNurse', 'Scrub Nurse') },
    { key: 'remarks', label: t('remarks', 'Remarks') },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
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
          const { diagnoses, anaesthetist, scrubNurse, surgeon, remarks } = await geIpdProcedureDetail(
            patientId,
            config,
          );
          const labFindings = await getPatientLabFindings(patientId, testOrderTypeUuid);
          const perOrderDetail = orders?.map((order) => ({
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
            patientName,
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
      const csvContent = [
        headers.map((header) => header.label).join(','),
        ...rows.flat().map((row) => headers.map((header) => row[header.key]).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'standard_theatre_list.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose?.();
    } catch (error) {
      showSnackbar({
        title: t('exportFailed', 'Failed to export the Standard Theatre List. Please try again.'),
        kind: 'error',
        subtitle: (error as Error)?.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button kind="primary" size={responseSize} onClick={handleExport} disabled={isExporting}>
      {isExporting ? <InlineLoading description={t('exporting', 'Exporting...')} /> : t('export', 'Export')}
    </Button>
  );
};

export default ExportStandardTheatreList;
