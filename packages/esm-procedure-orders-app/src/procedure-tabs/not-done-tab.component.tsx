import React, { type FC } from 'react';
import NotDoneList from '../not-done-list/not-done-list.component';

const NotDoneComponent: FC<{ queue: string }> = ({ queue }) => {
  return (
    <div>
      <NotDoneList fulfillerStatus={'DECLINED'} queue={queue} />
    </div>
  );
};

export default NotDoneComponent;
