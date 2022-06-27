import { useEffect } from 'react';

import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';

import {
  API_STATES,
  createStatefullApi,
  createApiState,
} from '../lib/statefullApi';
import { createApiCallWrapper } from '../lib/createApiCallWrapper';
import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const isObjectEmpty = (obj) =>
  obj &&
  Object.keys(obj).length === 0 &&
  Object.getPrototypeOf(obj) === Object.prototype;

const useStatefullApi = ({
  apiName,
  apiCall,
  initialResult = null,
  resultParser = null,
}) => {
  const { addSystemError } = useNotifications();
  const [{ apiStates }, setAppState] = useAppContext();

  const setApiState = ({ reqState, result = undefined }) =>
    setAppState((prev) => {
      // The next state for this `apiName`
      const nextApiState = createApiState({
        ...prev.apiStates[apiName],
        reqState,
        result,
      });

      // Rebuild the entirity of the `next` appState
      const next = {
        ...prev,
        apiStates: {
          ...prev.apiStates,
          [apiName]: nextApiState,
        },
      };
      debug('setApiState', { prev, next });
      return next;
    });

  // Build initial state
  const apiState = (apiStates || {})[apiName] || {};
  useEffect(() => {
    if (isObjectEmpty(apiState)) {
      // Update the state object so we can use it to set state and also return it
      Object.assign(apiState, {
        apiName,
        apiCall: createApiCallWrapper({
          apiName,
          apiCall,
          onPending: () => setApiState({ reqState: API_STATES.PENDING }),
          onComplete: (result) => {
            setApiState({ reqState: API_STATES.DONE, result });
            if (result.meta.isRuntimeException) {
              addSystemError(`[Beskrivelse for "${result.type}"]`);
            }
          },
          resultParser,
        }),
        result: initialResult,
      });
      // Insert the first state for this api
      setAppState((prev) => ({
        ...prev,
        apiStates: {
          ...prev.apiStates,
          [apiName]: createApiState(apiState),
        },
      }));
    }
  }, []);

  return createStatefullApi(apiState);
};

export { useStatefullApi };
