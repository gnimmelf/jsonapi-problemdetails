import { useEffect } from 'react';

import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';

import {
  API_REQ_STATES,
  createApiReqProxy,
  createApiReqState,
} from '../lib/apiReqState';
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
  const [{ apiReqStates }, setAppState] = useAppContext();

  const setApiReqState = ({ reqState, result = undefined }) =>
    setAppState((prev) => {
      debug('setApiReqState', { prev });
      // The prev state for this `apiName`
      const prevApiReqState = prev.apiReqStates[apiName] || {};
      // The next state for this `apiName`
      const nextApiReqState = createApiReqState({
        ...prev.apiReqStates[apiName],
        reqState,
        result: result || prevApiReqState.result,
      });

      // Rebuild the entirity of the `next` appState
      const next = {
        ...prev,
        apiReqStates: {
          ...prev.apiReqStates,
          [apiName]: nextApiReqState,
        },
      };
      debug('setApiReqState', { prev, next });
      return next;
    });

  // Build initial state
  const apiState = (apiReqStates || {})[apiName] || {};

  if (apiState.apiName !== apiName) {
    // Initial run
    const wrappedApiCall = createApiCallWrapper({
      apiName,
      apiCall,
      onPending: () => setApiReqState({ reqState: API_REQ_STATES.PENDING }),
      onComplete: (result) => {
        setApiReqState({ reqState: API_REQ_STATES.DONE, result });
        if (result.meta.isRuntimeException) {
          addSystemError(`[Beskrivelse for "${result.type}"]`);
        }
      },
      resultParser,
    });

    Object.assign(
      apiState,
      createApiReqState({
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
      apiReqStates: {
        ...prev.apiReqStates,
        [apiName]: apiState,
      },
    }));
  }, [apiState.apiName]);

  return createApiReqProxy(apiState);
};

export { useApiReq };
