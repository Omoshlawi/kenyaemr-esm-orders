import { moduleName } from './constants';
import { configSchema } from './config-schema';

import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { createLeftPanelLink } from './left-panel-link';

const options = {
  featureName: 'esm-imaging-orders-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const radiologyDashboard = getAsyncLifecycle(() => import('./imaging-orders.component'), options);

// t('radiologyAndImaging', 'Radiology and Imaging')
export const imagingOrdersLink = getAsyncLifecycle(
  () =>
    Promise.resolve({
      default: createLeftPanelLink({
        name: 'imaging-orders',
        title: 'radiologyAndImaging',
      }),
    }),
  options,
);

export const imagingOrderPanel = getAsyncLifecycle(
  () => import('./form/imaging-orders/imaging-order-basket-panel/imaging-order-basket-panel.extension'),
  options,
);
export const rejectImagingOrderModal = getAsyncLifecycle(
  () => import('./imaging-tabs/test-ordered/reject-order-dialog/reject-order-dialog.component'),
  options,
);
export const printReportModal = getAsyncLifecycle(() => import('./print/print-report-modal.component'), options);

// t('addImagingOrderWorkspaceTitle', 'Add Imaging order')
export const addImagingOrderWorkspace = getAsyncLifecycle(
  () => import('./form/imaging-orders/add-imaging-orders/add-imaging-order.workspace'),
  options,
);
export const searchPatientWorkspace = getAsyncLifecycle(
  () => import('./form/imaging-orders/search-patient.workspace'),
  options,
);

export const imagingReportForm = getAsyncLifecycle(
  () => import('./form/imaging-report-form/imaging-report-form.component'),
  options,
);
export const imagingReviewForm = getAsyncLifecycle(
  () => import('./form/review-form/review-imaging-form.workspace'),
  options,
);
export const addImagingToWorkListModal = getAsyncLifecycle(
  () => import('./imaging-tabs/test-ordered/pick-imaging-order/add-to-worklist-dialog.component'),
  options,
);
export const amendModal = getAsyncLifecycle(
  () => import('./imaging-tabs/test-ordered/amend-order-dialog/amend-imaging-dialog.component'),
  options,
);
export const imagingResultsComponent = getAsyncLifecycle(
  () => import('./imaging-results/imaging-results.component'),
  options,
);

export const renalWarningComponent = getAsyncLifecycle(
  () => import('./form/imaging-orders/renal-warning.component'),
  options,
);

