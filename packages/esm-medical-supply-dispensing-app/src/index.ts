import { getAsyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';

const options = {
  featureName: 'esm-medical-supply-dispensing-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const dispensing = getAsyncLifecycle(() => import('./medicalsupplydispensing.component'), options);

export const medicalSuppliesDispensingLink = getAsyncLifecycle(() => import('./dispensing-link.component'), options);

export const supplyDispensingDashboard = getAsyncLifecycle(
  () => import('./dashboard/dispensing-dashboard.component'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const dispensingDashboardLink = getAsyncLifecycle(
  () => import('./dashboard/dispensing-dashboard-link.component'),
  options,
);
