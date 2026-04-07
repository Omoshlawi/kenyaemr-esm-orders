import React from 'react';
import { useTranslation } from 'react-i18next';

import { useOrdersWorklist } from '../hooks/useOrdersWorklist';
import GroupedOrdersTable from '../shared/ui/common/grouped-orders-table.component';
import { DataTableSkeleton } from '@carbon/react';

interface CompletedListProps {
  fulfillerStatus: string;
  queue: string;
}

export const CompletedList: React.FC<CompletedListProps> = ({ fulfillerStatus, queue }) => {
  const { t } = useTranslation();

  const { workListEntries, isLoading } = useOrdersWorklist('COMPLETED', fulfillerStatus);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (workListEntries?.length >= 0) {
    return (
      <>
        <div>
          <GroupedOrdersTable
            orders={workListEntries}
            showActions={false}
            queue={queue}
            showStatus={true}
            showOrderType={true}
            showStartButton={false}
            title={t('completedOrders', 'Completed Orders')}
            actions={[]}
          />
        </div>
      </>
    );
  }
};
