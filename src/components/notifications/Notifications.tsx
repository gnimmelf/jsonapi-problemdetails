import React, { FC, useMemo } from 'react';

import {
  MESSAGE,
  WARNING,
  ERROR,
} from '../../constants/systemNotificationTypes';

import { useNotifications } from '../../useHooks/useNotifications';

import { isoStr2Time } from '../../helpers/isoStrFormatters';

const bgColors = {
  [MESSAGE]: 'bl-bg-green-4',
  [WARNING]: 'bl-bg-tomato-4',
  [ERROR]: 'bl-bg-tomato-1',
};

const RemoveIcon = ({ onClick }) => (
  <span
    className="bl-p-a-1"
    style={{
      cursor: 'pointer',
      position: 'absolute',
      top: 0,
      right: 0,
    }}
    onClick={onClick}
  >
    [X]
  </span>
);

const Notifications: FC = () => {
  const {
    systemNotifications,
    removeSystemNotification,
    clearSystemNotifications,
  } = useNotifications();

  const sortedNotifications = useMemo(() => {
    const sorted = systemNotifications;
    sorted.sort((a, b) => {
      if (a < b) return 1;
      if (a > b) return -1;
      return 0;
    });
    return sorted;
  }, [systemNotifications]);

  return systemNotifications.length ? (
    <div className="bl-bg-sand-4 bl-p-a-4" style={{ position: 'relative' }}>
      <RemoveIcon onClick={() => clearSystemNotifications()} />
      {sortedNotifications.map(({ message, type, datetimeISO, id }) => (
        <div
          key={id}
          className={`${bgColors[type]} bl-p-x-2 bl-p-y-1 bl-m-b-1`}
          style={{ position: 'relative' }}
        >
          {isoStr2Time(datetimeISO)} [{type}]: {message}{' '}
          <RemoveIcon onClick={() => removeSystemNotification({ id })} />
        </div>
      ))}
    </div>
  ) : null;
};

export { Notifications };
