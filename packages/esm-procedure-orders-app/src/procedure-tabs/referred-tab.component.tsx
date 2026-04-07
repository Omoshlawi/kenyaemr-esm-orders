import React, { type FC } from 'react';
import ReferredProcedures from '../referred-procedures/referred-procedures.component';

const ReferredComponent: FC<{ queue: string }> = ({ queue }) => {
  return (
    <div>
      <ReferredProcedures fulfillerStatus={'EXCEPTION'} queue={queue} />
    </div>
  );
};

export default ReferredComponent;
