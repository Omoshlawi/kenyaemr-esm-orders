import React, { useMemo, useState } from 'react';
import { ProcedureHeader } from './header/procedure-header.component';
import { useDefineAppContext } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

import { type DateFilterContext } from './types';
import ProcedureSummaryCards from './procedure-rooms/procedure-summary-cards.component';
import ProcedureRoomTabs from './procedure-rooms/procedure-room-tabs';
import { useProcedureServiceQueues } from './queues-form-extension/queue-form-extension.resources';

const Procedure: React.FC = () => {
  const [dateRange, setDateRange] = useState<Date[]>([dayjs().startOf('day').toDate(), new Date()]);
  const { errorLoadingQueues, isLoadingQueues, procedureQueues } = useProcedureServiceQueues();
  const [activeQueue, setActiveQueue] = useState<string>();
  const currentQueue = useMemo(() => activeQueue ?? procedureQueues?.[0]?.uuid, [activeQueue, procedureQueues]);
  useDefineAppContext<DateFilterContext>('procedures-date-filter', { dateRange, setDateRange });

  return (
    <div className={`omrs-main-content`}>
      <ProcedureHeader />
      <main className={`omrs-main-content`}>
        <ProcedureSummaryCards activeQueue={currentQueue} />
        <ProcedureRoomTabs
          activeQueue={currentQueue}
          onActiveQueueChange={setActiveQueue}
          procedureQueues={procedureQueues}
          isLoadingQueues={isLoadingQueues}
          errorLoadingQueues={errorLoadingQueues}
        />
      </main>
    </div>
  );
};

export default Procedure;
