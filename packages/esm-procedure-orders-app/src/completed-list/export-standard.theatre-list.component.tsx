import { Button } from '@carbon/react';
import { Export } from '@carbon/react/icons';
import { showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import React, { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { type Result, type Order } from '../types';
import { getPatientDiagnoses } from '../shared/ui/common/list-order-details.resource';
import { type ConfigObject } from '../config-schema';

type ExportStandardTheatreListProps = {
  patientOrders?: Array<{ patientId: string; orders: Array<Result> }>;
};

const ExportStandardTheatreList: FC<ExportStandardTheatreListProps> = ({ patientOrders = [] }) => {
  const { t } = useTranslation();
  const { procedureMajorCategoryConceptUuid, procedureMinorCategoryConceptUuid } = useConfig<ConfigObject>();
  const responseSize = useLayoutType() === 'tablet' ? 'md' : 'sm';
  const headers = [
    { key: 'patientName', label: t('patientName', 'Patient Name') },
    { key: 'ipNo', label: t('ipNo', 'IP/NO') },
    { key: 'patientGender', label: t('sex', 'Sex') },
    { key: 'patientAge', label: t('age', 'Age') },
    { key: 'diagnosis', label: t('diagnosis', 'Diagnosis') },
    { key: 'operation', label: t('operation', 'Operation') },
    { key: 'labFindings', label: t('labFindings', 'Lab Findings') },
    { key: 'surgeon', label: t('surgeon', 'Surgeon & Ass.Surgeon') },
    { key: 'anesthetist', label: t('anesthetist', 'Anesthetist') },
    { key: 'operationType', label: t('operationType', 'A/B') },
    { key: 'scrubNurse', label: t('scrubNurse', 'Scrub Nurse') },
    { key: 'remarks', label: t('remarks', 'Remarks') },
  ];

  const handleExport = async () => {
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
          const diagnoses = await getPatientDiagnoses(patientId);
          const perOrderDetail = orders?.map((order) => ({
            operation: order?.display || '-',
            operationType:
              order?.procedures?.[0]?.procedureOrder?.category?.uuid === procedureMinorCategoryConceptUuid
                ? t('minorAbr', 'A')
                : order?.procedures?.[0]?.procedureOrder?.category?.uuid === procedureMajorCategoryConceptUuid
                  ? t('majorAbr', 'B')
                  : '-',
            remarks: order?.instructions || '-',
          }));
          return perOrderDetail?.map((detail) => ({
            patientName,
            ipNo,
            patientGender,
            patientAge,
            diagnosis: diagnoses.map((d) => d.text).join(', ') || '-',
            operation: detail.operation,
            labFindings: '-', // Placeholder for lab findings data
            surgeon: '-', // Placeholder for surgeon data
            anesthetist: '-', // Placeholder for anesthetist data
            operationType: detail.operationType,
            scrubNurse: '-', // Placeholder for scrub nurse data
            remarks: detail.remarks,
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
    } catch (error) {
      showSnackbar({
        title: t('exportFailed', 'Failed to export the Standard Theatre List. Please try again.'),
        kind: 'error',
        subtitle: (error as Error)?.message,
      });
    }
  };

  return (
    <Button kind="ghost" size={responseSize} renderIcon={Export} onClick={handleExport}>
      {t('exportStandardTheatreList', 'Export Standard Theatre List')}
    </Button>
  );
};

export default ExportStandardTheatreList;
