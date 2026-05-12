import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, formatDate, launchWorkspace2, parseDate, showModal, useConfig } from '@openmrs/esm-framework';
import { type ListOrdersDetailsProps } from './grouped-imaging-types';
import { Accordion, AccordionItem, Button, InlineLoading, Tag, TextArea } from '@carbon/react';
import { Calendar, Printer } from '@carbon/react/icons';
import capitalize from 'lodash-es/capitalize';
import ActionButton from './action-button/action-button.component';
import { RenalWarningForOrder } from '../../../form/imaging-orders/renal-warning.component';
import styles from './list-order-details.scss';
import usePatientDiagnosis from './list-order-details.resource';
import DicomImages from '../../../imaging-results/dicom-images.component';
import { type ImagingConfig } from '../../../config-schema';

type OrderUrgency = 'ROUTINE' | 'STAT' | 'ON_SCHEDULED_DATE';

function getPriorityTagType(urgency: OrderUrgency) {
  switch (urgency) {
    case 'ROUTINE':
      return 'green';
    case 'STAT':
      return 'red';
    default:
      return 'gray';
  }
}

const ListOrderDetails: React.FC<ListOrdersDetailsProps> = ({ groupedOrders, showActions, actions }) => {
  const { t } = useTranslation();
  const orders = groupedOrders?.orders || [];
  const patientUuid = orders[0]?.patient?.uuid;
  const { diagnoses, isLoading } = usePatientDiagnosis(patientUuid);
  const { useDicom } = useConfig<ImagingConfig>();

  if (isLoading) {
    return <InlineLoading status="active" description={t('loading', 'Loading...')} />;
  }

  return (
    <div>
      {orders.map((row) => (
        <div key={row.uuid} className={styles.orderDetailsContainer}>
          <div className={styles.orderCardHeader}>
            <div className={styles.orderMeta}>
              <span className={styles.orderNumber}>
                {t('orderNumbers', 'Order number:')} {row.orderNumber}
              </span>
              <span className={styles.orderDate}>
                {t('orderDate', 'Order date:')} {row.dateActivated ? formatDate(parseDate(row.dateActivated)) : '--'}
              </span>
            </div>
            <div className={styles.statusBadge}>
              <span className={styles.statusLabel}>{t('orderStatus', 'Status:')}</span>
              <Tag size="md" type={row.fulfillerStatus ? 'blue' : 'warm-gray'}>
                {row.fulfillerStatus ? t(row.fulfillerStatus) : t('orderNotPicked', 'Order not picked')}
              </Tag>
            </div>
          </div>

          {(row.fulfillerStatus === null || row.fulfillerStatus === 'IN_PROGRESS') && (
            <div className={styles.renalContainer}>
              <RenalWarningForOrder conceptUuid={row.concept?.uuid} patientUuid={row.patient?.uuid} />
            </div>
          )}

          {(row.fulfillerStatus === null || row.fulfillerStatus === 'IN_PROGRESS') && (
            <div className={styles.appointmentContainer}>
              <div className={styles.appointmentSection}>
                <span className={styles.appointmentSectionTitle}>
                  {t('appointmentScheduling', 'Appointment scheduling')}
                </span>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={() => <Calendar size={16} />}
                  onClick={() =>
                    launchWorkspace2('appointments-form-workspace', {
                      patientUuid,
                      context: 'creating',
                    })
                  }>
                  {t('scheduleAppointment', 'Schedule appointment')}
                </Button>
              </div>
            </div>
          )}

          <div className={styles.orderCardBody}>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaItemLabel}>{t('urgencyStatus', 'Urgency')}</span>
                <div className={styles.metaItemValue}>
                  <Tag size="md" type={getPriorityTagType(row.urgency as OrderUrgency)}>
                    {row.urgency ? t(row.urgency, capitalize(row.urgency.replaceAll('_', ' '))) : '--'}
                  </Tag>
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaItemLabel}>{t('orderLocation', 'Order location')}</span>
                <div className={styles.metaItemValue}>
                  <Tag size="md" type="teal">
                    {row.encounter?.location?.display
                      ? capitalize(row.encounter.location.display)
                      : t('unknownLocation', 'Unknown location')}
                  </Tag>
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaItemLabel}>{t('diagnosis', 'Diagnosis')}</span>
                <div className={styles.metaItemValue}>
                  {diagnoses.length > 0 ? (
                    diagnoses.map((diagnosis) => (
                      <Tag size="md" type="warm-gray" key={diagnosis.id}>
                        {diagnosis.text ? capitalize(diagnosis.text) : t('noDiagnosis', 'No available diagnosis')}
                      </Tag>
                    ))
                  ) : (
                    <Tag size="md" type="warm-gray">
                      {t('noDiagnosis', 'No available diagnosis')}
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div>
              <table className={styles.detailsTable}>
                <tbody>
                  <tr>
                    <td className={styles.detailsTableLabel}>{t('testOrdered', 'Test ordered')}</td>
                    <td className={styles.detailsTableValue}>{capitalize(row.display || '--')}</td>
                  </tr>
                  <tr>
                    <td className={styles.detailsTableLabel}>{t('orderInStruction', 'Instructions')}</td>
                    <td className={styles.detailsTableValue}>
                      {row.instructions ? (
                        capitalize(row.instructions)
                      ) : (
                        <Tag size="md" type="warm-gray">
                          {t('NoInstructionLeft', 'No instructions are provided.')}
                        </Tag>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.detailsTableLabel}>{t('orderReason', 'Order reason')}</td>
                    <td className={styles.detailsTableValue}>{capitalize(row.orderReasonNonCoded || '--')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {useDicom && <div>{row.fulfillerStatus !== null && <DicomImages accessionNumber={row.orderNumber} />}</div>}

            {row.procedures?.[0]?.procedureReport && (
              <Accordion>
                <AccordionItem title={<span className={styles.accordionTitle}>{t('viewReport', 'View Report')}</span>}>
                  <TextArea
                    className={styles.textAreaInput}
                    labelText={t('imagingReports', 'Imaging report')}
                    id={`report-${row.uuid}`}
                    name={`report-${row.uuid}`}
                    value={row.procedures[0].procedureReport}
                    readOnly
                  />
                  <ExtensionSlot name="patient-chart-attachments-dashboard-slot" state={{ patientUuid }} />
                  <div className={styles.reportActions}>
                    <Button
                      kind="tertiary"
                      className={styles.printBtn}
                      onClick={() => {
                        const dispose = showModal('print-preview-Report-modal', {
                          onClose: () => dispose(),
                          approvedOrder: row,
                        });
                      }}
                      size="sm"
                      renderIcon={() => <Printer size={18} />}>
                      {t('printReport', 'Print report')}
                    </Button>
                  </div>
                </AccordionItem>
              </Accordion>
            )}
          </div>

          <div className={styles.ordererRow}>
            <span className={styles.ordererLabel}>{t('ordererName', 'Ordered by:')}</span>
            <span className={styles.ordererName}>{capitalize(row.orderer?.display || '--')}</span>
          </div>

          {showActions && (
            <div className={styles.buttonSection}>
              <div className={styles.actionBtns}>
                {actions
                  .sort((a, b) => a.order - b.order)
                  .map((action) => (
                    <ActionButton
                      key={action.actionName}
                      action={action}
                      order={row}
                      patientUuid={row.patient?.uuid || ''}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListOrderDetails;
