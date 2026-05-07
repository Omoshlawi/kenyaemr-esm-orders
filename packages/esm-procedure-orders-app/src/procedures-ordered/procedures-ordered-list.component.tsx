import { DataTableSkeleton } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrdersWorklist } from '../hooks/useOrdersWorklist';
import GroupedOrdersTable from '../shared/ui/common/grouped-orders-table.component';
interface ProcedurePatientListProps {
  fulfillerStatus: string;
  filterByPatient?: (patientUuid: string) => boolean;
}

const ProcedureOrderedList: React.FC<ProcedurePatientListProps> = ({ filterByPatient }) => {
  const { t } = useTranslation();
  const { workListEntries, isLoading } = useOrdersWorklist('', '');

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (workListEntries?.length >= 0) {
    return (
      <GroupedOrdersTable
        orders={workListEntries}
        showActions={true}
        showStatus={true}
        showOrderType={true}
        showStartButton={false}
        title={t('orderedProcedures', 'Ordered Procedures')}
        actions={[
          {
            actionName: 'add-procedure-to-worklist-dialog',
          },
          { actionName: 'reject-procedure-order-dialog' },
        ]}
        filterByPatient={filterByPatient}
      />
    );
  }
};

export default ProcedureOrderedList;
