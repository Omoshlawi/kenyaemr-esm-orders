import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageHeaderContent, ExtensionSlot, XrayPictogram } from '@openmrs/esm-framework';
import styles from './imagining-header.scss';

export const ImagingPageHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageHeader}>
      <PageHeader className={styles.PageHeader} data-testid="patient-queue-header">
        <PageHeaderContent illustration={<XrayPictogram />} title={t('radiologyAndImaging', 'Radiology and Imaging')} />{' '}
        <div className={styles.pageHeaderActions}>
          <ExtensionSlot className={styles.providerBannerInfoSlot} name="provider-banner-info-slot" />
        </div>
      </PageHeader>
    </div>
  );
};
