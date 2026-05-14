import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, restBaseUrl } from '@openmrs/esm-framework';
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
    const viewerUrl = `/openmrs/${restBaseUrl}/orthanc${dicomViewerMap[viewerName]}${studyId}`;
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
            {studies.map((study) => {
              const rawDate = study.mainDicomTags.StudyDate;
              const isoDate =
                rawDate?.length === 8
                  ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
                  : rawDate;
              return (
                <StructuredListRow key={study.uuid}>
                  <StructuredListCell>{study.mainDicomTags.AccessionNumber ?? '--'}</StructuredListCell>
                  <StructuredListCell>{isoDate ? formatDate(parseDate(isoDate)) : '--'}</StructuredListCell>
                  <StructuredListCell>{study.mainDicomTags.StudyDescription || '--'}</StructuredListCell>
                  <StructuredListCell className={styles.actionCell}>
                    <OverflowMenu size="sm" aria-label={t('actions', 'Actions')} flipped>
                      <OverflowMenuItem
                        itemText={t('viewOnStoneViewer', 'View on stone viewer')}
                        onClick={() => handleViewStudy(study.mainDicomTags.StudyInstanceUID, 'stone-webviewer')}
                      />
                    </OverflowMenu>
                  </StructuredListCell>
                </StructuredListRow>
              );
            })}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </Layer>
  );
};

export default DicomImages;
