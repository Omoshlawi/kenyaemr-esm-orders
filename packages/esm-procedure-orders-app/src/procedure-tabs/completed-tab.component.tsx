import React from 'react';
import { CompletedList } from '../completed-list/completed-list.component';

const CompletedComponent = ({ filterByPatient }: { filterByPatient?: (patientUuid: string) => boolean }) => {
  return (
    <div>
      <CompletedList fulfillerStatus={'COMPLETED'} filterByPatient={filterByPatient} />
    </div>
  );
};

export default CompletedComponent;
