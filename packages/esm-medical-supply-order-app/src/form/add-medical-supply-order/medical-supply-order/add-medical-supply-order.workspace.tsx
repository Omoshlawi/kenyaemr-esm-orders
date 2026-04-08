import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useLayoutType, Workspace2 } from '@openmrs/esm-framework';
import { MedicalSupplyTypeSearch } from './medical-supply-type-search';
import { MedicalSupplyOrderForm } from './medical-supply-form.component';
import styles from './add-medical-supply-order.scss';
import { type MedicalSupplyOrderBasketItem } from '../../../types';
import { type OrderBasketWindowProps, type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';

export interface AddMedicalSupplyOrderWorkspace {
  order?: MedicalSupplyOrderBasketItem;
}

export default function AddMedicalSupplyOrderWorkspace({
  groupProps: { patient, visitContext },
  workspaceProps: { order: initialOrder },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddMedicalSupplyOrderWorkspace, OrderBasketWindowProps>) {
  const { t } = useTranslation();

  const [currentMedicalSupplyOrder, setCurrentMedicalSupplyOrder] = useState(initialOrder);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isTablet = useLayoutType() === 'tablet';

  const cancelOrder = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  if (!currentMedicalSupplyOrder) {
    return (
      <Workspace2
        title={t('addMedicalSupplyOrderWorkspaceTitle', 'Add Medical Supply order')}
        hasUnsavedChanges={hasUnsavedChanges}>
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowLeft size={24} {...props} />}
            iconDescription="Return to order basket"
            size="sm"
            onClick={cancelOrder}>
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
        <MedicalSupplyTypeSearch
          openMedicalSupplyForm={setCurrentMedicalSupplyOrder}
          patient={patient}
          visitContext={visitContext}
          closeWorkspace={closeWorkspace}
        />
      </Workspace2>
    );
  } else {
    return (
      <Workspace2
        title={t('addMedicalSupplyOrderWorkspaceTitle', 'Add Medical Supply order')}
        hasUnsavedChanges={hasUnsavedChanges}>
        <MedicalSupplyOrderForm
          initialOrder={currentMedicalSupplyOrder}
          closeWorkspace={closeWorkspace}
          patient={patient}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />
      </Workspace2>
    );
  }
}
