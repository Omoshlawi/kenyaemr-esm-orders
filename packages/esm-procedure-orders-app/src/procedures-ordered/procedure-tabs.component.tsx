import React, { useState } from 'react';
import { type AssignedExtension, Extension, useAssignedExtensions } from '@openmrs/esm-framework';
import { Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './procedure-queue.scss';
import ProcedureOrderedList from './procedures-ordered-list.component';
import { ComponentContext } from '@openmrs/esm-framework/src/internal';
import { useProcedureOrderStats } from '../summary-tiles/procedure-summary.resource';
import type { Result } from '../types';

const procedurePanelSlot = 'procedures-panels-slot';

// The props are only passed for queued workflow from express-workflow-app
type ProcedureOrdersTabsProps = {
  filterByOrder?: (order: Result) => boolean;
  filterByPatient?: (patientUuid: string) => boolean;
};
const ProcedureOrdersTabs: React.FC<ProcedureOrdersTabsProps> = ({ filterByOrder, filterByPatient }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const tabExtensions = useAssignedExtensions(procedurePanelSlot) as AssignedExtension[];

  // Get individual statistics each tab using their fulfillerstatus
  const activeOrdersStats = useProcedureOrderStats('', filterByOrder);
  const inProgressStats = useProcedureOrderStats('IN_PROGRESS', filterByOrder);
  const referredStats = useProcedureOrderStats('EXCEPTION', filterByOrder);
  const notDoneStats = useProcedureOrderStats('DECLINED', filterByOrder);
  const completedStats = useProcedureOrderStats('COMPLETED', filterByOrder);

  // Returns appropriate statistics based on their tab names
  const getStatsForTab = (tabName: string) => {
    switch (tabName) {
      case 'procedures-worklist-tab-component':
        return inProgressStats;
      case 'procedures-referred-tab-component':
        return referredStats;
      case 'procedures-not-done-tab-component':
        return notDoneStats;
      case 'procedures-completed-tab-component':
        return completedStats;
      default:
        return { count: 0, isLoading: false, isError: false };
    }
  };

  return (
    <main className={`omrs-main-content`}>
      <section className={styles.orderTabsContainer}>
        <Tabs selectedIndex={selectedTab} onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="Procedure tabs" contained>
            <Tab>
              {t('proceduresOrdered', 'Active Orders')} ({activeOrdersStats.isLoading ? '...' : activeOrdersStats.count}
              )
            </Tab>
            {tabExtensions
              .filter((extension) => Object.keys(extension.meta).length > 0)
              .map((extension, index) => {
                const { name, title } = extension.meta;
                if (name && title) {
                  const stats = getStatsForTab(extension.name);
                  return (
                    <Tab key={index} className={styles.tab} id={`${title || index}-tab`}>
                      {t(title, {
                        ns: extension.moduleName,
                        defaultValue: title,
                      })}
                      ({stats.isLoading ? '...' : stats.count})
                    </Tab>
                  );
                } else {
                  return null;
                }
              })}
          </TabList>
          <TabPanels>
            <TabPanel style={{ padding: 0 }}>
              <ProcedureOrderedList fulfillerStatus="NEW" filterByPatient={filterByPatient} />
            </TabPanel>
            {tabExtensions
              .filter((extension) => Object.keys(extension.meta).length > 0)
              .map((extension, index) => {
                return (
                  <TabPanel key={`${extension.meta.title}-tab-${index}`}>
                    <ComponentContext.Provider
                      key={extension.id}
                      value={{
                        featureName: extension.meta.featureName,
                        moduleName: extension.moduleName,
                        extension: {
                          extensionId: extension.id,
                          extensionSlotName: procedurePanelSlot,
                          extensionSlotModuleName: extension.moduleName,
                        },
                      }}>
                      <Extension state={{ filterByOrder, filterByPatient }} />
                    </ComponentContext.Provider>
                  </TabPanel>
                );
              })}
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default ProcedureOrdersTabs;
