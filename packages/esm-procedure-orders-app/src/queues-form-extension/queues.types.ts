import type { OpenmrsResource } from '@openmrs/esm-framework';
import type { MutableRefObject } from 'react';

export type QueueEntryFilters = {
  queues?: string[]; // UUIDs of queues
  location?: string[]; // UUIDs of locations
  service?: string[]; // UUIDs of services
  patient?: string; // Patient UUID
  visit?: string; // Visit UUID
  hasVisit?: boolean;
  priorities?: string[]; // UUIDs of priority concepts
  statuses?: string[]; // UUIDs of status concepts
  locationsWaitingFor?: string[]; // UUIDs of locations
  providersWaitingFor?: string[]; // UUIDs of providers
  queuesComingFrom?: string[]; // UUIDs of queues
  startedOnOrAfter?: string; // ISO date string
  startedOnOrBefore?: string; // ISO date string
  startedOn?: string; // ISO date string
  isEnded?: boolean;
  endedOnOrAfter?: string; // ISO date string
  endedOnOrBefore?: string; // ISO date string
  endedOn?: string; // ISO date string
  includedVoided?: boolean;
};

export type QueueEntriesPagination = {
  totalPages: number;
  totalCount: number;
  currentPage: number;
  currentPageSize: MutableRefObject<number>;
  paginated: boolean;
  showNextButton: boolean;
  showPreviousButton: boolean;
  goTo: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  defaultPageSize: number;
};

export interface FHIRResponse {
  entry: Array<{ resource: fhir.Location }>;
  total: number;
  type: string;
  resourceType: string;
}

export interface Queue {
  uuid: string;
  display: string;
  name: string;
  description: string;
  location: Location;
  service: Concept;
  allowedPriorities: Array<Concept>;
  allowedStatuses: Array<Concept>;
  queueRooms: Array<OpenmrsResource>;
}
export interface Concept extends OpenmrsResource {
  setMembers?: Array<Concept>;
}

export interface QueueRoom {
  uuid: string;
  display: string;
  name: string;
  description: string;
  queue: {
    uuid: string;
    display: string;
    service: {
      uuid: string;
      display: string;
    };
    location: {
      uuid: string;
      display: string;
    };
  };
}
