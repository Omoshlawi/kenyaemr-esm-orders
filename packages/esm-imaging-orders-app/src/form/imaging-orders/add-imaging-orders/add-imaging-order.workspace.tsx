import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { type Visit, Workspace2, age, formatDate, getPatientName, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { TestTypeSearch } from './imaging-type-search';
import { ImagingOrderForm } from './imaging-order-form.component';
import styles from './add-imaging-order.scss';
import { type ImagingOrderBasketItem } from '../../../types';
import { type OrderBasketWindowProps, type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib/src';

export interface AddImagingOrderWorkspace {
  order?: ImagingOrderBasketItem;
  patient: fhir.Patient;
  visitContext: Visit;
}

export default function AddImagingOrderWorkspace({
  groupProps: { patient, visitContext },
  workspaceProps: { order: initialOrder },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddImagingOrderWorkspace, OrderBasketWindowProps>) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as ImagingOrderBasketItem);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const cancelOrder = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  return (
    <Workspace2 title={t('addImagingOrderWorkspaceTitle', 'Add Imaging order')} hasUnsavedChanges={hasUnsavedChanges}>
      <div className={styles.container}>
        {isTablet && (
          <div className={styles.patientHeader}>
            <span className={styles.bodyShort02}>{patient ? getPatientName(patient) : '--'}</span>
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
          <TestTypeSearch openLabForm={setCurrentLabOrder} patient={patient} visitContext={visitContext} closeWorkspace={closeWorkspace} />
        ) : (
          <ImagingOrderForm
            initialOrder={currentLabOrder}
            closeWorkspace={closeWorkspace}
            patient={patient}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        )}
      </div>
    </Workspace2>
  );
}
