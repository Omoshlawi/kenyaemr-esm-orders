import React, { type FC } from 'react';
import { CompletedList } from '../completed-list/completed-list.component';

const CompletedComponent: FC<{ queue: string }> = ({ queue }) => {
  return (
    <div>
      <CompletedList fulfillerStatus={'COMPLETED'} queue={queue} />
    </div>
  );
};

export default CompletedComponent;
