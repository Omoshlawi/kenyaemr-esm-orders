import { getAsyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';

import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel-link';

const moduleName = '@kenyaemr/esm-procedure-orders-app';

const options = {
  featureName: 'esm-procedure-orders-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const expressProceduresDashboard = getAsyncLifecycle(() => import('./procedure.component'), options);

// t('Procedures', 'Procedures')
export const procedureDashboardLink = getAsyncLifecycle(
  () =>
    Promise.resolve({
      default: createLeftPanelLink({
        name: 'procedure',
        title: 'Procedures',
      }),
    }),
  options,
);

// Modals and tab components (lazy-loaded to reduce initial bundle size)
export const rejectProcedureOrderDialogComponent = getAsyncLifecycle(
  () => import('./procedures-ordered/reject-order-dialog/reject-procedure-order-dialog.component'),
  options,
);
export const worklistProceduresTabComponent = getAsyncLifecycle(
  () => import('./procedure-tabs/work-list-tab.component'),
  options,
);
export const referredProceduresTabComponent = getAsyncLifecycle(
  () => import('./procedure-tabs/referred-tab.component'),
  options,
);
export const completedProceduresTabComponent = getAsyncLifecycle(
  () => import('./procedure-tabs/completed-tab.component'),
  options,
);
export const notDoneProceduresTabComponent = getAsyncLifecycle(
  () => import('./procedure-tabs/not-done-tab.component'),
  options,
);
export const procedureInstructionsModalComponent = getAsyncLifecycle(
  () => import('./procedures-ordered/procedure-instructions/procedure-instructions.component'),
  options,
);
export const procedureRejectModalComponent = getAsyncLifecycle(
  () => import('./procedures-ordered/reject-reason/procedure-reject-reason.component'),
  options,
);
export const addProcedureToWorklistDialogComponent = getAsyncLifecycle(
  () => import('./procedures-ordered/pick-procedure-order/add-to-worklist-dialog.component'),
  options,
);

export const proceduresOrderPanel = getAsyncLifecycle(
  () => import('./form/procedures-orders/procedures-order-basket-panel/procedures-order-basket-panel.extension'),
  options,
);
export const postProcedureResults = getAsyncLifecycle(
  () => import('./form/post-procedures/post-procedure-form.component'),
  options,
);
export const printProcedureReportModal = getAsyncLifecycle(
  () => import('./print/print-procedure-results.component'),
  options,
);

// t('addProcedureOrderWorkspaceTitle', 'Add procedure order')
export const addProceduresOrderWorkspace = getAsyncLifecycle(
  () => import('./form/procedures-orders/add-procedures-order/add-procedures-order.workspace'),
  options,
);
export const procedureResultsComponent = getAsyncLifecycle(
  () => import('./procedure-results/procedure-results.component'),
  options,
);
export const procedureOrderSearchPatientWorkspace = getAsyncLifecycle(
  () => import('./form/search-patient-workspace/search-patient.workspace'),
  options,
);
