import { useEffect } from 'react';

import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';

import {
  API_STATES,
  createStatefullApi,
  createApiStateValue,
} from '../lib/statefullApi';
import { createApiCallWrapper } from '../lib/createApiCallWrapper';
import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const createSetApiState = ({ apiName, apiStateValue, setAppState }) => {
  const setApiState = ({ reqState, result = undefined }) => {
    setAppState((prev) => {
      // On first run `prev.apiStates` does not exist
      const prevApiStates = prev?.apiStates || {};

      // The next state for this `apiName`
      const nextApiState = {
        ...(prevApiStates[apiName] || apiStateValue),
        // Result is eiter passed or is initial value
        result: result || apiStateValue.result,
        reqState,
      };

      // Rebuild the entirity of the `next` appState
      const next = {
        ...prev,
        apiStates: {
          ...prevApiStates,
          [apiName]: nextApiState,
        },
      };
      debug('setApiState', { prev, next });
      return next;
    });
  };
  return setApiState;
};

const useApi = ({
  apiName,
  apiCall,
  initialValue = null,
  resultParser = null,
}) => {
  const { addSystemError } = useNotifications();
  const [{ apiStates }, setAppState] = useAppContext();

  // Get current or create a new `apiState` object
  let apiStateValue = (apiStates || {})[apiName];
  if (!apiStateValue) {
    apiStateValue = createApiStateValue({
      apiName,
      result: initialValue,
    });
  }

  const setApiState = createSetApiState({
    apiName,
    apiStateValue,
    setAppState,
  });

  const apiCallWrapper = createApiCallWrapper({
    apiName,
    apiCall,
    resultParser,
    onPending: () => setApiState({ reqState: API_STATES.PENDING }),
    onComplete: (result) => {
      setApiState({ reqState: API_STATES.DONE, result });
      if (result.meta.isRuntimeException) {
        addSystemError(`[Beskrivelse for "${result.type}"]`);
      }
    },
  });

  useEffect(() => {
    if (!apiStateValue.apiCall) {
      debug(`Should only happen once for '${apiName}'!`);
      // Startup: set the callWrapper on the `apiStateValue` object
      apiStateValue.apiCall = apiCallWrapper;
      // And then "insert" the first state for this api
      setApiState(apiStateValue);
    }
  }, []);

  return createStatefullApi(apiStateValue);
};

export { useApi };
