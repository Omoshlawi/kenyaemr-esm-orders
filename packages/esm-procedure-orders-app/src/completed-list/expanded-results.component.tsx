import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Layer } from '@carbon/react';
import { ErrorState, ExtensionSlot } from '@openmrs/esm-framework';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { type Result } from '../types';
import { useLabOrders } from './completed-list.resource';
import styles from './completed-list.scss';

type ExpandedResultsProps = { patientOrders?: Array<{ patientId: string; orders: Array<Result> }>; orderUuid: string };

const ExpandedResults: React.FC<ExpandedResultsProps> = ({ patientOrders, orderUuid }) => {
  const { t } = useTranslation();
  const patientUuid = patientOrders?.find((po) => po.orders.some((o) => o.uuid === orderUuid))?.patientId;
  const { labOrders, isLoading, error } = useLabOrders({
    patient: patientUuid,
    excludeDiscontinueOrders: true,
    excludeCanceledAndExpired: false,
  });
  const title = t('labFindings', 'Lab Findings');
  if (isLoading) {
    return <DataTableSkeleton />;
  }
  if (error) {
    return <ErrorState headerTitle={title} error={error} />;
  }

  if (!labOrders?.length) {
    return <EmptyState headerTitle={title} displayText={title} />;
  }
  return (
    <div className={styles.labFindings}>
      {labOrders.map((order) => (
        <Layer key={order.uuid}>
          <CardHeader title={order.display} children={undefined} />
          <ExtensionSlot name="completed-lab-order-results-slot" state={{ order }} />
        </Layer>
      ))}
    </div>
  );
};

export default ExpandedResults;
