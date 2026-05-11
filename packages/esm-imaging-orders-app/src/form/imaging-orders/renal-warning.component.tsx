import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  InlineNotification,
  SkeletonText,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { Microscope } from '@carbon/react/icons';
import { formatDate, launchWorkspace2, showSnackbar, useConfig, usePatient, useVisit } from '@openmrs/esm-framework';
import { type ImagingConfig } from '../../config-schema';
import { type ImagingOrderBasketItem } from '../../types';
import { useLatestRenalFunctionPanel } from '../../hooks/useRenalLabResults';
import styles from './renal-warning.scss';

type RenalWarningProps = {
  order: ImagingOrderBasketItem;
  patient: fhir.Patient;
};

const RenalWarning: React.FC<RenalWarningProps> = ({ order, patient }) => {
  const { t } = useTranslation();
  const { radiologyOrdersRequiringRenalFunctionCheck, renalFunctionTestConceptUuid } = useConfig<ImagingConfig>();

  const matchedConfig = radiologyOrdersRequiringRenalFunctionCheck.find(
    ({ procedureConceptUuid }) => order.testType?.conceptUuid === procedureConceptUuid,
  );

  if (!matchedConfig || !patient?.id) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.sectionTitle}>{t('renalFunctionResults', 'Renal function results')}</p>
      <RenalLabResults
        patientUuid={patient.id}
        testConceptUuid={renalFunctionTestConceptUuid}
        validityPeriodInDays={matchedConfig.labResultValidityPeriodInDays}
      />
    </div>
  );
};

export default RenalWarning;

type RenalWarningForOrderProps = {
  conceptUuid: string;
  patientUuid: string;
};

export const RenalWarningForOrder: React.FC<RenalWarningForOrderProps> = ({ conceptUuid, patientUuid }) => {
  const { t } = useTranslation();
  const { radiologyOrdersRequiringRenalFunctionCheck, renalFunctionTestConceptUuid } = useConfig<ImagingConfig>();

  const matchedConfig = radiologyOrdersRequiringRenalFunctionCheck.find(
    ({ procedureConceptUuid }) => conceptUuid === procedureConceptUuid,
  );

  if (!matchedConfig) {
    return null;
  }

  return (
    <>
      {matchedConfig && (
        <div className={styles.container}>
          <p className={styles.sectionTitle}>{t('renalFunctionResults', 'Renal function results')}</p>
          <RenalLabResults
            patientUuid={patientUuid}
            testConceptUuid={renalFunctionTestConceptUuid}
            validityPeriodInDays={matchedConfig.labResultValidityPeriodInDays}
          />
        </div>
      )}
    </>
  );
};

type RenalLabResultsProps = {
  patientUuid: string;
  testConceptUuid: string;
  validityPeriodInDays: number;
};

const RenalLabResults: React.FC<RenalLabResultsProps> = ({ patientUuid, testConceptUuid, validityPeriodInDays }) => {
  const { t } = useTranslation();
  const { patient, isLoading: isPatientLoading } = usePatient(patientUuid);
  const { activeVisit, mutate: mutateVisitContext } = useVisit(patientUuid);
  const { interpretedResults, isLoading, error, lastResultDate } = useLatestRenalFunctionPanel(
    patientUuid,
    testConceptUuid,
    validityPeriodInDays,
  );

  if (isLoading) {
    return <SkeletonText paragraph lineCount={4} />;
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title={t('renalResultsError', 'Could not load renal function results')}
        subtitle={error?.message}
        lowContrast
      />
    );
  }

  if (!interpretedResults.length) {
    const lastDoneText = lastResultDate
      ? t('renalResultsLastDone', 'Last result: {{date}} (valid for {{validityDuration}} day(s)).', {
          date: formatDate(new Date(lastResultDate), { noToday: true }),
          validityDuration: validityPeriodInDays,
        })
      : t('renalResultsNoneOnFile', 'No previous result on file.');

    const subtitle = `${t(
      'renalResultsRequiredSubtitle',
      'A recent RFT is required before ordering this test.',
    )} ${lastDoneText}`;

    return (
      <>
        <InlineNotification
          className={styles.renalFunctionTestNotification}
          aria-label={t('renalResultsRequired', 'Renal function results required')}
          hideCloseButton
          kind="error"
          lowContrast
          role="alert"
          statusIconDescription={t('renalResultsRequired', 'Renal function results required')}
          subtitle={subtitle}
          title={t('renalResultsRequiredTitle', 'Renal function test required')}
        />
        <Button
          kind="ghost"
          size="sm"
          renderIcon={() => <Microscope size={16} />}
          disabled={isPatientLoading}
          onClick={() => {
            if (!activeVisit) {
              showSnackbar({
                title: t('visitRequired', 'Visit required'),
                subtitle: t('startVisitBeforeOrderingLabTest', 'Please start a visit before ordering a lab test.'),
                kind: 'error',
              });
              return;
            }
            launchWorkspace2(
              'imaging-renal-order-basket-workspace',
              { patient, patientUuid, visitContext: activeVisit, mutateVisitContext },
              {
                patient,
                patientUuid,
                visitContext: activeVisit,
                mutateVisitContext,
                labOrderWorkspaceName: 'imaging-renal-add-lab-order-workspace',
                visibleOrderPanels: ['imaging-renal-add-lab-order-workspace'],
              },
            );
          }}>
          {t('orderLabTest', 'Order lab test')}
        </Button>
      </>
    );
  }

  return (
    <StructuredListWrapper className={styles.list}>
      <StructuredListHead>
        <StructuredListRow head>
          <StructuredListCell head>{t('test', 'Test')}</StructuredListCell>
          <StructuredListCell head>{t('value', 'Value')}</StructuredListCell>
          <StructuredListCell head>{t('interpretation', 'Interpretation')}</StructuredListCell>
        </StructuredListRow>
      </StructuredListHead>
      <StructuredListBody>
        {interpretedResults.map((result, i) => (
          <StructuredListRow key={i}>
            <StructuredListCell>{result.testName}</StructuredListCell>
            <StructuredListCell>{result.value}</StructuredListCell>
            <StructuredListCell className={styles[result.interpretationClass]}>
              <span>{result.interpretation}</span>
            </StructuredListCell>
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
  );
};
