import { MutableRefObject, useMemo } from 'react';
import {
  type FetchResponse,
  fhirBaseUrl,
  getLocale,
  openmrsFetch,
  type OpenmrsResource,
  restBaseUrl,
  useConfig,
  useOpenmrsPagination,
  type Visit,
} from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { useSWRConfig } from 'swr/_internal';
import useSWR from 'swr';
import { type ConfigObject } from '../config-schema';
import { type QueueEntryPayload } from '../types';
import dayjs from 'dayjs';
import type { FHIRResponse, Queue, QueueEntriesPagination, QueueEntryFilters, QueueRoom } from './queues.types';

export function useQueueLocations() {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const { data, error, isLoading } = useSWRImmutable<{ data: FHIRResponse }>(apiUrl, openmrsFetch);

  const queueLocations = useMemo(
    () =>
      data?.data?.entry
        ?.map((response) => response.resource)
        .sort((a, b) => a.name.localeCompare(b.name, getLocale())) ?? [],
    [data?.data?.entry],
  );
  return { queueLocations, isLoading, error };
}

export async function generateVisitQueueNumber(
  location: string,
  visitUuid: string,
  queueUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  const abortController = new AbortController();

  await openmrsFetch(
    `${restBaseUrl}/queue-entry-number?location=${location}&queue=${queueUuid}&visit=${visitUuid}&visitAttributeType=${visitQueueNumberAttributeUuid}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    },
  );
}

export async function postQueueEntry(
  visitUuid: string,
  queueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  sortWeight: number,
  locationUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  const abortController = new AbortController();

  await Promise.all([generateVisitQueueNumber(locationUuid, visitUuid, queueUuid, visitQueueNumberAttributeUuid)]);

  return openmrsFetch(`${restBaseUrl}/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      visit: { uuid: visitUuid },
      queueEntry: {
        status: {
          uuid: status,
        },
        priority: {
          uuid: priority,
        },
        queue: {
          uuid: queueUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: new Date(),
        sortWeight: sortWeight,
      },
    },
  });
}

export function useQueues(locationUuid?: string) {
  const customRepresentation =
    'custom:(uuid,display,name,description,service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display),queueRooms:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue?v=${customRepresentation}` + (locationUuid ? `&location=${locationUuid}` : '');

  const { data, ...rest } = useSWRImmutable<FetchResponse<{ results: Array<Queue> }>, Error>(apiUrl, openmrsFetch);

  const queues = useMemo<Array<Queue>>(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queues,
    ...rest,
  };
}

export function useMutateQueueEntries() {
  const { mutate } = useSWRConfig();

  return {
    mutateQueueEntries: () => {
      return mutate((key) => {
        return (
          typeof key === 'string' &&
          (key.includes(`${restBaseUrl}/queue-entry`) || key.includes(`${restBaseUrl}/visit-queue-entry`))
        );
      }).then(() => {
        window.dispatchEvent(new CustomEvent('queue-entry-updated'));
      });
    },
  };
}

export function useQueueRooms() {
  const customRepresentation =
    'custom:(uuid,display,name,description,queue:(uuid,display,location:(uuid,display),service:(uuid,display)))';
  const apiUrl = `${restBaseUrl}/queue-room?v=${customRepresentation}`;

  const { data, ...rest } = useSWR<FetchResponse<{ results: Array<QueueRoom> }>, Error>(apiUrl, openmrsFetch);

  const queueRooms = useMemo<Array<QueueRoom>>(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queueRooms,
    ...rest,
  };
}

export interface QueueEntry {
  uuid: string;
  display: string;
  queue: Queue;
  sortWeight: number;
  startedAt: string;
  resourceVersion: string;
  visit: Visit;
  patient: OpenmrsResource & {
    person: OpenmrsResource & {
      gender: OpenmrsResource;
      birthdate: string;
    };
  };
}

export function usePatientQueueEntries(patientUuid: string) {
  const rep =
    'custom:(uuid,display,queue,status,patient:(uuid,display,person,identifiers:(uuid,display,identifier,identifierType)),visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided),attributes:(uuid,display,value,attributeType)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';
  const apiUrl = `${restBaseUrl}/queue-entry?patient=${patientUuid}&isEnded-false&totalCount=true&v=${rep}`;

  const { data, ...rest } = useSWR<FetchResponse<{ results: Array<QueueEntry> }>, Error>(apiUrl, openmrsFetch);

  const patientQueueEntries = useMemo<Array<QueueEntry>>(() => data?.data?.results ?? [], [data?.data?.results]);

  return {
    patientQueueEntries,
    ...rest,
  };
}

export const useProcedureServiceQueues = () => {
  const { queues, isLoading: isLoadingQueues, error: errorLoadingQueues } = useQueues();
  const { procedureServiceConceptUuid } = useConfig<ConfigObject>();

  const procedureQueues = useMemo(
    () =>
      queues
        .filter((queue) => queue.service.uuid === procedureServiceConceptUuid && queue?.queueRooms?.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [queues, procedureServiceConceptUuid],
  );

  return {
    procedureQueues,
    isLoadingQueues,
    errorLoadingQueues,
  };
};

export const addPatientToQueue = async (payload: QueueEntryPayload) => {
  const url = `${restBaseUrl}/visit-queue-entry`;
  const res = await openmrsFetch<QueueEntry>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });
  return res.data;
};

export const useQueueEntries = (filters?: QueueEntryFilters, defaultPageSize: number = 10) => {
  const { outpatientVisitTypeUuid } = useConfig<{ outpatientVisitTypeUuid: string }>({
    externalModuleName: '@kenyaemr/esm-express-workflow-app',
  });
  const repString =
    'custom:(uuid,queue:(uuid,display,name,location:(uuid,display)),status:(uuid,display),patient:(uuid,person:(uuid,display),identifiers:(uuid,display,identifier,identifierType:(uuid,display))),visit:(uuid,visitType:(uuid),attributes:(uuid,value,attributeType:(uuid))),priority:(uuid,display),priorityComment,startedAt,previousQueueEntry:(uuid,queue:(uuid,display)))';

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.append('v', repString);

    const merged = {
      ...filters,
      status: filters?.statuses ?? [],
      statuses: undefined,
      startedOnOrAfter: filters?.startedOnOrAfter ?? undefined,
      startedOnOrBefore: filters?.startedOnOrBefore ?? undefined,
      queue: filters?.queues ?? [],
    };
    if (merged) {
      Object.entries(merged).forEach(([key, value]) => {
        if (key === 'statuses' || value === undefined || value === null) {
          return;
        }
        if (Array.isArray(value)) {
          [...value].sort((a, b) => String(a).localeCompare(String(b))).forEach((v) => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      });
    }

    if (filters?.isEnded == null) {
      params.append('isEnded', 'false');
    }

    return params.toString();
  }, [filters]);

  const url = queryString ? `/ws/rest/v1/queue-entry?${queryString}` : '/ws/rest/v1/queue-entry';

  const {
    data,
    isLoading,
    isValidating,
    error,
    totalPages,
    totalCount,
    currentPage,
    currentPageSize,
    paginated,
    showNextButton,
    showPreviousButton,
    goTo,
    goToNext,
    goToPrevious,
  } = useOpenmrsPagination<QueueEntry>(url, defaultPageSize, {
    swrConfig: {
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  });

  const queueEntries = useMemo(() => {
    return (data ?? [])?.filter((entry) => {
      return (
        dayjs(entry.startedAt).isAfter(dayjs().subtract(24, 'hour')) &&
        entry?.visit?.visitType?.uuid === outpatientVisitTypeUuid
      );
    });
  }, [data, outpatientVisitTypeUuid]);

  const pagination: QueueEntriesPagination = {
    totalPages,
    totalCount,
    currentPage,
    currentPageSize,
    paginated,
    showNextButton,
    showPreviousButton,
    goTo,
    goToNext,
    goToPrevious,
    defaultPageSize,
  };

  return {
    queueEntries,
    isLoading,
    isValidating,
    error,
    pagination,
  };
};
