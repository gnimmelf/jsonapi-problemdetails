import { ERROR, MESSAGE, WARNING } from '../constants/systemNotificationTypes';

import { uuidv4 } from '../helpers/uuidv4';

import { useAppContext } from './useAppContext';

import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const useNotifications = () => {
  const [{ systemNotifications }, setAppState] = useAppContext();

  const addSystemNotification = ({ message, type = MESSAGE }) => {
    setAppState((prev) => {
      const value = prev.systemNotifications.concat({
        id: uuidv4(),
        type,
        message,
        datetimeISO: new Date().toISOString(),
      });

      return {
        ...prev,
        systemNotifications: value,
      };
    });
  };

  const addSystemMessage = (message) =>
    addSystemNotification({
      message,
    });

  const addSystemWarning = (message) =>
    addSystemNotification({
      type: WARNING,
      message,
    });

  const addSystemError = (message) =>
    addSystemNotification({
      type: ERROR,
      message,
    });

  const removeSystemNotification = ({ id }) => {
    setAppState((prev) => {
      const value = prev.systemNotifications.filter(
        ({ id: needle }) => needle !== id,
      );

      return {
        ...prev,
        systemNotifications: value,
      };
    });
  };

  const clearSystemNotifications = () => {
    setAppState((prev) => {
      return {
        ...prev,
        systemNotifications: [],
      };
    });
  };

  return {
    systemNotifications,
    addSystemNotification,
    addSystemMessage,
    addSystemWarning,
    addSystemError,
    removeSystemNotification,
    clearSystemNotifications,
  };
};

export { useNotifications };
