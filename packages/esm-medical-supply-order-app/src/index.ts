import { getAsyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@kenyaemr/esm-medical-supply-orders-app';

const options = {
  featureName: 'esm-medical-supply-orders-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const medicalSupplyOrderPanel = getAsyncLifecycle(
  () => import('./form/add-medical-supply-order/medical-supply-order-basket-panel/medical-supply-order-basket-panel.extension'),
  options,
);
export const addMedicalSupplyOrderWorkspace = getAsyncLifecycle(
  () => import('./form/add-medical-supply-order/medical-supply-order/add-medical-supply-order.workspace'),
  options,
);
