import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  InlineLoading,
  InlineNotification,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from '@carbon/react';
import { useDicomImages } from '../hooks/useDicomImages';
import styles from './imaging-results.scss';
import { type ImagingConfig } from '../config-schema';
import { openWindow } from './dicom-util';

type DicomImagesProps = {
  accessionNumber: string; // Maps to OpenMRS orderNumber
};

const dicomViewerMap = {
  'stone-webviewer': '/stone-webviewer/index.html?study=',
  ohif: '/ohif/viewer?StudyInstanceUIDs=',
  'ohif-segmentation': '/ohif/segmentation?StudyInstanceUIDs=',
} as const;

type DicomViewer = keyof typeof dicomViewerMap;

const DicomImages: React.FC<DicomImagesProps> = ({ accessionNumber }) => {
  const { t } = useTranslation();
  const { orthancServerUrl } = useConfig<ImagingConfig>();
  const { studies, isLoading, error } = useDicomImages(accessionNumber);

  if (isLoading) {
    return <InlineLoading status="active" description={t('loadingDicomImages', 'Loading DICOM images...')} />;
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title={t('errorLoadingDicomImages', 'Error loading DICOM images')}
        subtitle={error.message}
        lowContrast
        hideCloseButton
      />
    );
  }

  if (studies.length === 0) {
    return null;
  }

  const handleViewStudy = (studyId: string, viewerName: DicomViewer) => {
    const viewerUrl = `${orthancServerUrl}${dicomViewerMap[viewerName]}${studyId}`;
    openWindow(viewerUrl, { width: 1200, height: 800 });
  };

  return (
    <Layer>
      <div className={styles.dicomSection}>
        <p className={styles.dicomSectionTitle}>{t('dicomImages', 'DICOM Images')}</p>
        <StructuredListWrapper isCondensed isFlush ariaLabel={t('dicomImages', 'DICOM Images')}>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('accessionNumber', 'Accession Number')}</StructuredListCell>
              <StructuredListCell head>{t('studyDate', 'Study Date')}</StructuredListCell>
              <StructuredListCell head>{t('studyDescription', 'Study Description')}</StructuredListCell>
              <StructuredListCell head />
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {studies.map((study) => (
              <StructuredListRow key={study.ID}>
                <StructuredListCell>{study.MainDicomTags.AccessionNumber ?? '--'}</StructuredListCell>
                <StructuredListCell>{formatDate(parseDate(study.MainDicomTags.StudyDate))}</StructuredListCell>
                <StructuredListCell>{study.MainDicomTags.StudyDescription || '--'}</StructuredListCell>
                <StructuredListCell className={styles.actionCell}>
                  <OverflowMenu size="sm" aria-label={t('actions', 'Actions')} flipped>
                    <OverflowMenuItem
                      itemText={t('viewOnStoneViewer', 'View on stone viewer')}
                      onClick={() => handleViewStudy(study.MainDicomTags.StudyInstanceUID, 'stone-webviewer')}
                    />
                    <OverflowMenuItem
                      itemText={t('viewOnOHIF', 'View on OHIF')}
                      onClick={() => handleViewStudy(study.MainDicomTags.StudyInstanceUID, 'ohif')}
                    />
                  </OverflowMenu>
                </StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </Layer>
  );
};

export default DicomImages;
