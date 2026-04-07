import React from 'react';
import { useOrdersWorklist } from '../hooks/useOrdersWorklist';
import GroupedOrdersTable from '../shared/ui/common/grouped-orders-table.component';
import { DataTableSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
interface ProcedurePatientListProps {
  fulfillerStatus: string;
  queue: string;
}

const ProcedureOrderedList: React.FC<ProcedurePatientListProps> = ({ queue }) => {
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
        queue={queue}
        title={t('orderedProcedures', 'Ordered Procedures')}
        actions={[
          {
            actionName: 'add-procedure-to-worklist-dialog',
          },
          { actionName: 'reject-procedure-order-dialog' },
        ]}
      />
    );
  }
};

export default ProcedureOrderedList;
