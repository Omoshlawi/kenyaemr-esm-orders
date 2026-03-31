import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import {
  age,
  formatDate,
  launchWorkspace,
  parseDate,
  useLayoutType,
  usePatient,
  Workspace2,
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';
import {
  type OrderBasketWindowProps,
  type PatientWorkspace2DefinitionProps,
  type OrderBasketItem,
} from '@openmrs/esm-patient-common-lib';
import { TestTypeSearch } from './procedures-type-search';
import { ProceduresOrderForm } from './procedures-order-form.component';
import styles from './add-procedures-order.scss';
import { type ProcedureOrderBasketItem } from '../../../types';

export interface AddProceduresOrderWorkspace {
  order?: ProcedureOrderBasketItem;
}

export default function AddProceduresOrderWorkspace({
  groupProps: { patient, visitContext },
  workspaceProps: { order: initialOrder },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddProceduresOrderWorkspace, OrderBasketWindowProps>) {
  const { t } = useTranslation();

  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as ProcedureOrderBasketItem);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isTablet = useLayoutType() === 'tablet';

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  const cancelOrder = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  return (
    <Workspace2
      title={t('addProceduresOrderWorkspaceTitle', 'Add Procedures order')}
      hasUnsavedChanges={hasUnsavedChanges}>
      <div className={styles.container}>
        {isTablet && (
          <div className={styles.patientHeader}>
            <span className={styles.bodyShort02}>{patientName}</span>
            <span className={classNames(styles.text02, styles.bodyShort01)}>
              {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
              <span>
                {formatDate(parseDate(patient?.birthDate), {
                  mode: 'wide',
                  time: false,
                })}
              </span>
            </span>
          </div>
        )}
        {!isTablet && (
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
        )}
        {!currentLabOrder ? (
          <div>
            <TestTypeSearch
              openLabForm={setCurrentLabOrder}
              patient={patient}
              visitContext={visitContext}
              closeWorkspace={closeWorkspace}
            />
          </div>
        ) : (
          <div>
            <ProceduresOrderForm
              initialOrder={currentLabOrder}
              closeWorkspace={closeWorkspace}
              setHasUnsavedChanges={setHasUnsavedChanges}
              patient={patient}
              visitContext={visitContext}
            />
          </div>
        )}
      </div>
    </Workspace2>
  );
}
