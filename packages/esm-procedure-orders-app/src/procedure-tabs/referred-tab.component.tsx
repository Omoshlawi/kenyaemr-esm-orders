import React from 'react';
import ReferredProcedures from '../referred-procedures/referred-procedures.component';

const ReferredComponent = ({ filterByPatient }: { filterByPatient?: (patientUuid: string) => boolean }) => {
  return (
    <div>
      <ReferredProcedures fulfillerStatus={'EXCEPTION'} filterByPatient={filterByPatient} />
    </div>
  );
};

export default ReferredComponent;
