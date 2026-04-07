import React, { useMemo } from 'react';
import styles from './procedure-summary.scss';
import { useTranslation } from 'react-i18next';
import { useQueueEntries } from '../queues-form-extension/queue-form-extension.resources';
import { useOrdersWorklist } from '../hooks/useOrdersWorklist';

type ProcedureSummaryCardsProps = {
  activeQueue: string;
};
const ProcedureSummaryCards: React.FC<ProcedureSummaryCardsProps> = ({ activeQueue }) => {
  const { queueEntries, isLoading, error } = useQueueEntries({ queues: [activeQueue] });
  const { workListEntries: activeOrders } = useOrdersWorklist('', '');
  const { workListEntries: inProgressOrders } = useOrdersWorklist('', 'IN_PROGRESS');
  const { workListEntries: completedOrders } = useOrdersWorklist('', 'COMPLETED');
  function groupOrdersById(orders) {
    if (orders && orders.length > 0) {
      const groupedOrders = orders.reduce((acc, item) => {
        if (!acc[item.patient.uuid]) {
          acc[item.patient.uuid] = [];
        }
        acc[item.patient.uuid].push(item);
        return acc;
      }, {});

      // Convert the result to an array of objects with patientId and orders
      return Object.keys(groupedOrders).map((patientId) => ({
        patientId: patientId,
        orders: groupedOrders[patientId],
      }));
    } else {
      return [];
    }
  }
  const activeOrdersCount = useMemo(
    () =>
      groupOrdersById(activeOrders).filter((patient) =>
        queueEntries.some((entry) => entry.patient.uuid === patient.patientId),
      ).length,
    [activeOrders, queueEntries],
  );
  const inProgressOrdersCount = useMemo(
    () =>
      groupOrdersById(inProgressOrders).filter((patient) =>
        queueEntries.some((entry) => entry.patient.uuid === patient.patientId),
      ).length,
    [inProgressOrders, queueEntries],
  );
  const completedOrdersCount = useMemo(
    () =>
      groupOrdersById(completedOrders).filter((patient) =>
        queueEntries.some((entry) => entry.patient.uuid === patient.patientId),
      ).length,
    [completedOrders, queueEntries],
  );

  const { t } = useTranslation();
  return (
    <div className={styles.tileContainer}>
      <div className={styles.tile}>
        <strong>{t('awaitingProcedure', 'Awaiting Procedure')}</strong>
        <span>{activeOrdersCount}</span>
      </div>
      <div className={styles.tile}>
        <strong>{t('ongoingProcedures', 'Ongoing Procedures')}</strong>
        <span>{inProgressOrdersCount}</span>
      </div>
      <div className={styles.tile}>
        <strong>{t('completedProcedures', 'Completed Procedures')}</strong>
        <span>{completedOrdersCount}</span>
      </div>
    </div>
  );
};

export default ProcedureSummaryCards;
