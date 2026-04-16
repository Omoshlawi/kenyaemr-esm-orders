import React from 'react';
import NotDoneList from '../not-done-list/not-done-list.component';

const NotDoneComponent = ({ filterByPatient }: { filterByPatient?: (patientUuid: string) => boolean }) => {
  return (
    <div>
      <NotDoneList fulfillerStatus={'DECLINED'} filterByPatient={filterByPatient} />
    </div>
  );
};

export default NotDoneComponent;
