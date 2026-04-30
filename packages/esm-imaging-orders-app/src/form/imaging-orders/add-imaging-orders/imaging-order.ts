import { type Visit } from '@openmrs/esm-framework';
import { type ImagingOrderBasketItem } from '../../../types';
import { type ImagingType } from './useImagingTypes';



// TODO add priority option `{ value: "ON_SCHEDULED_DATE", label: "On scheduled date" }` once the form supports a date.
export function createEmptyLabOrder(testType: ImagingType, orderer: string, visit: Visit): ImagingOrderBasketItem {
  return {
    action: 'NEW',
    display: testType.label,
    testType,
    orderer,
    visit,
  };
}
