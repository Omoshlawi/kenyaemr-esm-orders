import React from 'react';
import { Grid, Column, SelectSkeleton, InlineNotification, Select, SelectItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './queue-fields.scss';
import { useProcedureServiceQueues } from './queue-form-extension.resources';
import { type OpenmrsResource } from '@openmrs/esm-framework';
import { InputWrapper } from '../form/procedures-orders/add-procedures-order/procedures-order-form.component';
import type { Queue } from './queues.types';

type QueueFieldProps = {
  value?: Queue;
  onChange: (room: Queue | undefined) => void;
  patientUuid: string;
};

const QueueFields: React.FC<QueueFieldProps> = ({ value, onChange, patientUuid }) => {
  const { t } = useTranslation();
  const { procedureQueues, isLoadingQueues } = useProcedureServiceQueues();

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const queueUuid = event.target.value;
    const selectedRoom = procedureQueues.find((queue) => queue.uuid === queueUuid);
    onChange(selectedRoom);
  };

  return (
    <Grid className={styles.gridRow}>
      <Column lg={16} md={8} sm={4}>
        <InputWrapper>
          <section className={styles.section}>
            {isLoadingQueues ? (
              <SelectSkeleton />
            ) : procedureQueues.length === 0 ? (
              <InlineNotification
                className={styles.inlineNotification}
                kind="error"
                lowContrast
                subtitle={t('configureQueueRooms', 'Please configure procedure queue rooms to continue.')}
                title={t('noQueueRoomsConfigured', 'No queue rooms configured')}
              />
            ) : (
              <Select
                labelText={t('selectProcedureRoom', 'Select a procedure room')}
                id="procedureRoom"
                name="procedureRoom"
                invalidText={t('required', 'Required')}
                // The select's value is now driven solely by the value prop's uuid
                value={value?.uuid || ''}
                helperText={t(
                  'patientWillBeAddedToSelectedQueueRoom',
                  'The patient will be added to the selected queue room when you save.',
                )}
                onChange={handleSelectChange}>
                {/* Placeholder option */}
                <SelectItem text={t('selectOption', 'Choose an option')} value="" />

                {procedureQueues.map((queue) => {
                  const locationSuffix = (queue?.location as unknown as OpenmrsResource)?.display
                    ? ` - ${(queue.location as unknown as OpenmrsResource).display}`
                    : '';

                  return (
                    <SelectItem
                      key={queue.uuid}
                      text={`${queue.queueRooms?.[0]?.display}${locationSuffix}`}
                      value={queue.uuid}
                    />
                  );
                })}
              </Select>
            )}
          </section>
        </InputWrapper>
      </Column>
    </Grid>
  );
};

export default QueueFields;
