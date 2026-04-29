import { type Visit } from '@openmrs/esm-framework';
import type { ProcedureOrderBasketItem } from '../../../types';
import type { ProceduresType } from './useProceduresTypes';

export function createEmptyLabOrder(testType: ProceduresType, orderer: string, visit: Visit): ProcedureOrderBasketItem {
  return {
    action: 'NEW',
    display: testType.label,
    testType,
    orderer,
    visit,
  };
}
