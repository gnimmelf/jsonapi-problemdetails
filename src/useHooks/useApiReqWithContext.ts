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

const useApiReq = ({
  apiName,
  apiCall,
  initialResultData = null,
  resultParser = null,
}) => {
  const { addSystemError } = useNotifications();
  const [{ apiStates }, setAppState] = useAppContext();

  const setApiState = ({ reqState, result = undefined }) =>
    setAppState((prev) => {
      debug('setApiState', { prev });
      // The prev state for this `apiName`
      const prevApiState = prev.apiStates[apiName] || {};
      // The next state for this `apiName`
      const nextApiState = createApiState({
        ...prev.apiStates[apiName],
        reqState,
        result: result || prevApiState.result,
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

  if (apiState.apiName !== apiName) {
    // Initial run
    const wrappedApiCall = createApiCallWrapper({
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
    });

    Object.assign(
      apiState,
      createApiState({
        apiName,
        apiCall: wrappedApiCall,
        result: { data: initialResultData },
      }),
    );
  }

  useEffect(() => {
    // Insert the first state for this api
    debug(`Should only run once for api '${apiName}'`);
    setAppState((prev) => ({
      ...prev,
      apiStates: {
        ...prev.apiStates,
        [apiName]: apiState,
      },
    }));
  }, [apiState.apiName]);

  return createStatefullApi(apiState);
};

export { useApiReq };
