import React, { Suspense, lazy } from 'react';
import { TabPanels, TabList, Tabs, Tab, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useOrdersWorkList } from '../hooks/useOrdersWorklist';
import { useImagingOrderStats } from '../shared/imaging.resource';

import styles from './imaging-tabs.scss';

// Lazy-load tab content to reduce initial bundle size
const ImagingOrderSearch = lazy(() => import('./search/imaging-order-search.component'));
const TestsOrdered = lazy(() =>
  import('./test-ordered/tests-ordered.component').then((m) => ({ default: m.TestsOrdered })),
);
const WorkList = lazy(() => import('./work-list/work-list.component'));
const ReferredTests = lazy(() =>
  import('./referred-test/referred-ordered.component').then((m) => ({ default: m.ReferredTests })),
);
const Review = lazy(() =>
  import('./review-ordered/review-ordered.component').then((m) => ({ default: m.Review })),
);
const ApprovedOrders = lazy(() =>
  import('./approved/approved-orders.component').then((m) => ({ default: m.ApprovedOrders })),
);
const OrdersNotDone = lazy(() => import('./orders-not-done/orders-not-done.component'));

export const ImagingTabs: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams<{ patientUuid: string }>();

  const { activeOrdersCount, workListCount, referredTestsCount, ordersNotDoneCount } = useOrderCounts();
  const { pendingReviewCount, approvedOrdersCount } = useCompletedOrders();

  const searchTab = [
    { label: 'search', text: t('search', 'Search'), count: 0, LazyComponent: ImagingOrderSearch, componentProps: {} },
  ];

  const tabsData = [
    ...(params.patientUuid ? searchTab : []),
    {
      label: 'pendingOrders',
      text: t('activeOrders', 'Active Orders'),
      count: activeOrdersCount,
      LazyComponent: TestsOrdered,
      componentProps: {},
    },
    {
      label: 'workList',
      text: t('workList', 'WorkList'),
      count: workListCount,
      LazyComponent: WorkList,
      componentProps: { fulfillerStatus: 'IN_PROGRESS' as const },
    },
    {
      label: 'referredProcedures',
      text: t('referredOut', 'Referred Out'),
      count: referredTestsCount,
      LazyComponent: ReferredTests,
      componentProps: {},
    },
    {
      label: 'review',
      text: t('pendingReview', 'Pending Review'),
      count: pendingReviewCount,
      LazyComponent: Review,
      componentProps: {},
    },
    {
      label: 'approved',
      text: t('approved', 'Approved'),
      count: approvedOrdersCount,
      LazyComponent: ApprovedOrders,
      componentProps: {},
    },
    {
      label: 'notDone',
      text: t('notDone', 'Not Done'),
      count: ordersNotDoneCount,
      LazyComponent: OrdersNotDone,
      componentProps: { fulfillerStatus: 'DECLINED' as const },
    },
  ];

  return (
    <div className={styles.imagingTabsContainer}>
      <Tabs>
        <TabList aria-label="List of tabs" contained style={{ marginLeft: '1rem' }}>
          {tabsData.map(({ label, text, count }) => (
            <Tab key={label}>
              {t(label, text)} {count > 0 ? `(${count})` : ''}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsData.map(({ label, LazyComponent, componentProps }) => (
            <TabPanel key={label}>
              <Suspense fallback={null}>
                {/* LazyComponent + componentProps are paired per tab; cast needed for union in map */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LazyComponent {...(componentProps as any)} />
              </Suspense>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

const useOrderCounts = () => {
  const { count: activeOrdersCount } = useImagingOrderStats('');
  const { count: workListCount } = useImagingOrderStats('IN_PROGRESS');
  const { count: referredTestsCount } = useImagingOrderStats('EXCEPTION');
  const { count: ordersNotDoneCount } = useImagingOrderStats('DECLINED');

  return { activeOrdersCount, workListCount, referredTestsCount, ordersNotDoneCount };
};

const useCompletedOrders = () => {
  const { workListEntries } = useOrdersWorkList('', 'COMPLETED');
  const pendingReview = workListEntries.filter((item) =>
    item.procedures?.some((procedure) => procedure.outcome !== 'SUCCESSFUL'),
  );
  const pendingReviewCount = pendingReview?.length ?? 0;
  const approved = workListEntries.filter((item) =>
    item.procedures?.some((procedure) => procedure.outcome === 'SUCCESSFUL'),
  );
  const approvedOrdersCount = approved?.length ?? 0;

  return { pendingReviewCount, approvedOrdersCount };
};
