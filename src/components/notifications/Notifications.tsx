import React, { FC, useMemo } from 'react';

import {
  MESSAGE,
  WARNING,
  ERROR,
} from '../../constants/systemNotificationTypes';

import { useNotifications } from '../../useHooks/useNotifications';

import { isoStr2Time } from '../../helpers/isoStrFormatters';

export const messageTypeClassNames = {
  [MESSAGE]: 'bl-border--aqua bl-bg-aqua-4',
  [WARNING]: 'bl-border--ocre bl-bg-ocre-4',
  [ERROR]: 'bl-border--tomato bl-bg-tomato-4',
};

const RemoveIcon = ({ onClick }) => (
  <span
    className="bl-p-a-1 bl-p-r-4"
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
    <div
      className="bl-text-center"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        boxSizing: 'border-box',
        zIndex: '999',
      }}
    >
      <div
        className="bl-p-a-4"
        style={{ backdropFilter: 'blur(4px) saturate(150%)' }}
      >
        <RemoveIcon onClick={() => clearSystemNotifications()} />
        {sortedNotifications.map(({ message, type, datetimeISO, id }) => (
          <div
            key={id}
            className={`${messageTypeClassNames[type]} bl-p-x-2 bl-p-y-1 bl-m-b-1`}
            style={{ position: 'relative' }}
          >
            {isoStr2Time(datetimeISO)} [{type}]: {message}{' '}
            <RemoveIcon onClick={() => removeSystemNotification({ id })} />
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export { Notifications };
