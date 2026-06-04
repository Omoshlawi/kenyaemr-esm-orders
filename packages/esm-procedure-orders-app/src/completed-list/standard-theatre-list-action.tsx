import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Export } from '@carbon/react/icons';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { type Result } from '../types';

type StandardTheatreListActionProps = {
  patientOrders?: Array<{ patientId: string; orders: Array<Result> }>;
};
const StandardTheatreListAction: React.FC<StandardTheatreListActionProps> = ({ patientOrders = [] }) => {
  const { t } = useTranslation();
  const responseSize = useLayoutType() === 'tablet' ? 'md' : 'sm';
  const handleShowStandardTheatreList = () => {
    const dispose = showModal('standard-theatre-list-modal', {
      patientOrders,
      onClose: () => dispose(),
      size: 'lg',
    });
  };
  return (
    <Button
      kind="ghost"
      size={responseSize}
      renderIcon={Export}
      onClick={handleShowStandardTheatreList}
      disabled={!patientOrders?.length}>
      {t('exportStandardTheatreList', 'Export Standard Theatre List')}
    </Button>
  );
};

export default StandardTheatreListAction;
