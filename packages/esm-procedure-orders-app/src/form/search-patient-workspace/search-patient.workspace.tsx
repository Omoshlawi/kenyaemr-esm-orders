import React, { useCallback, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import {
  ExtensionSlot,
  launchWorkspaceGroup,
  setCurrentVisit,
  useVisit,
  showSnackbar,
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';

import styles from './search-patient-workspace.scss';

const SearchPatientWorkspace: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const [patientUuid, setPatientUuid] = useState<string | undefined>(undefined);
  const { activeVisit, isLoading: isLoadingVisits } = useVisit(patientUuid);

  const launchAddImagingOrderWorkspace = useCallback(
    (patientUuid: string) => {
      if (!activeVisit) {
        showSnackbar({
          kind: 'warning',
          title: t('noActiveVisit', 'No active visit'),
          subtitle: t('noActiveVisitSubtitle', 'Start a visit to add a procedure order.'),
          isLowContrast: true,
          timeoutInMs: 5000,
        });
        closeWorkspace();
        return;
      }

      setCurrentVisit(patientUuid, activeVisit.uuid);
    },
    [activeVisit, t, closeWorkspace],
  );

  useEffect(() => {
    if (patientUuid && !isLoadingVisits) {
      launchAddImagingOrderWorkspace(patientUuid);
    }
  }, [patientUuid, isLoadingVisits, launchAddImagingOrderWorkspace]);

  return (
    <div className={styles.container}>
      <ExtensionSlot
        name="patient-search-bar-slot"
        state={{
          selectPatientAction: (patientUuid: string) => {
            setPatientUuid(patientUuid);
          },
          buttonProps: {
            kind: 'primary',
          },
        }}
      />
    </div>
  );
};

export default SearchPatientWorkspace;
