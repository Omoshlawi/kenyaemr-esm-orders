import { ExtensionSlot, useDefineAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { ProcedureHeader } from './header/procedure-header.component';

import { type DateFilterContext } from './types';
import { useOrdersWorklist } from './hooks/useOrdersWorklist';
import ProcedureOrdersTabs from './procedures-ordered/procedure-tabs.component';

const Procedure: React.FC = () => {
  const [dateRange, setDateRange] = useState<Date[]>([dayjs().startOf('day').toDate(), new Date()]);
  useDefineAppContext<DateFilterContext>('procedures-date-filter', { dateRange, setDateRange });
  const isprocedureQueueEnabled = useFeatureFlag('procedureQueues');
  // Orders required by the ProcedureQueue component from express workflow
  const { workListEntries: activeOrders } = useOrdersWorklist('', '');
  const { workListEntries: inProgressOrders } = useOrdersWorklist('', 'IN_PROGRESS');
  const { workListEntries: completedOrders } = useOrdersWorklist('', 'COMPLETED');

  return (
    <div className={`omrs-main-content`}>
      <ProcedureHeader />
      {isprocedureQueueEnabled ? (
        <ExtensionSlot
          name="procedure-orders-dashboard-slot"
          state={{ activeOrders, inProgressOrders, completedOrders }}
        />
      ) : (
        <ProcedureOrdersTabs />
      )}
    </div>
  );
};

export default Procedure;
