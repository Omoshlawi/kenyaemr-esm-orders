import React from 'react';
import WorkList from '../work-list/work-list.component';
import styles from '../queue-list/procedure-queue.scss';

const WorkListComponent = ({ filterByPatient }: { filterByPatient?: (patientUuid: string) => boolean }) => {
  return (
    <div>
      <WorkList fulfillerStatus={'IN_PROGRESS'} filterByPatient={filterByPatient} />
    </div>
  );
};

export default WorkListComponent;
