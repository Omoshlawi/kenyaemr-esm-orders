import { openmrsFetch, restBaseUrl, useAppContext, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { type Result } from '../imaging-tabs/work-list/work-list.resource';
import { type ImagingConfig } from '../config-schema';
import { type FulfillerStatus } from '../shared/ui/common/grouped-imaging-types';
import { type DateFilterContext } from '../types';

const ORDER_RESPONSE_FORMAT =
  'custom:(uuid,orderNumber,patient:(uuid,display,identifiers,person:(uuid,display,age,gender)),' +
  'concept:(uuid,display,conceptClass),action,careSetting,orderer:ref,urgency,instructions,' +
  'orderReasonNonCoded,orderReason,bodySite,laterality,commentToFulfiller,procedures,display,' +
  'fulfillerStatus,dateStopped,scheduledDate,dateActivated,fulfillerComment,encounter)';

const ACTIVE_FULFILLER_STATUSES: ReadonlySet<FulfillerStatus> = new Set([
  'IN_PROGRESS',
  'DECLINED',
  'COMPLETED',
  'EXCEPTION',
]);

interface BuildOrderUrlParams {
  orderTypeUuid: string;
  activatedOnOrAfterDate: string;
  activatedOnOrBeforeDate: string;
  fulfillerStatus: FulfillerStatus;
}

const buildOrderUrl = ({
  orderTypeUuid,
  activatedOnOrAfterDate,
  activatedOnOrBeforeDate,
  fulfillerStatus,
}: BuildOrderUrlParams): string => {
  const params = new URLSearchParams({
    orderTypes: orderTypeUuid,
    activatedOnOrAfterDate,
    activatedOnOrBeforeDate,
    isStopped: 'false',
    fulfillerStatus: fulfillerStatus ?? '',
    v: ORDER_RESPONSE_FORMAT,
  });

  return `${restBaseUrl}/order?${params.toString()}`;
};

interface OrdersResponse {
  data: { results: Array<Result> };
}

interface UseOrdersWorkListReturn {
  workListEntries: Array<Result>;
  isLoading: boolean;
  isError: Error | undefined;
  mutate: () => void;
}

export function useOrdersWorkList(
  activatedOnOrAfterDate: string,
  fulfillerStatus: FulfillerStatus,
): UseOrdersWorkListReturn {
  const {
    orders: { radiologyOrderTypeUuid },
    radiologyConceptClassUuid,
  } = useConfig<ImagingConfig>();

  const dateFilterContext = useAppContext<DateFilterContext>('imaging-date-filter');

  const [startDate, endDate] = useMemo(() => {
    const range = dateFilterContext?.dateRange ?? [dayjs().startOf('day').toDate(), new Date()];
    return [range[0].toISOString(), range[1].toISOString()];
  }, [dateFilterContext?.dateRange]);

  const apiUrl = useMemo(
    () =>
      buildOrderUrl({
        orderTypeUuid: radiologyOrderTypeUuid,
        activatedOnOrAfterDate: startDate,
        activatedOnOrBeforeDate: endDate,
        fulfillerStatus,
      }),
    [radiologyOrderTypeUuid, startDate, endDate, fulfillerStatus],
  );

  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(apiUrl, openmrsFetch);

  const filterOrders = useCallback(
    (order: Result): boolean => {
      const isActive = order.dateStopped === null;
      const isRadiology = order.concept?.conceptClass?.uuid === radiologyConceptClassUuid;

      if (!isActive || !isRadiology) {
        return false;
      }

      if (!fulfillerStatus) {
        return order.fulfillerStatus === null && order.action === 'NEW';
      }

      if (ACTIVE_FULFILLER_STATUSES.has(fulfillerStatus)) {
        return order.fulfillerStatus === fulfillerStatus && order.action !== 'DISCONTINUE';
      }

      return false;
    },
    [radiologyConceptClassUuid, fulfillerStatus],
  );

  const workListEntries = useMemo(() => {
    const results = data?.data?.results;
    if (!results?.length) {
      return [];
    }

    return results.filter(filterOrders).sort((a, b) => {
      const aIsStat = a.urgency === 'STAT' ? 0 : 1;
      const bIsStat = b.urgency === 'STAT' ? 0 : 1;
      if (aIsStat !== bIsStat) {
        return aIsStat - bIsStat;
      }
      return new Date(a.dateActivated).getTime() - new Date(b.dateActivated).getTime();
    });
  }, [data, filterOrders]);

  return {
    workListEntries,
    isLoading,
    isError: error,
    mutate,
  };
}
