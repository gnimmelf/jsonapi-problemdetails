import { useState, useEffect } from 'react';

import {
  createApiCallWrapper,
  getResultFieldErrors,
} from '../lib/createApiCallWrapper';
import {
  API_STATES,
  createStatefullApi,
  createApiState,
} from '../lib/statefullApi';

import { useNotifications } from './useNotifications';

import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const useApiReq = ({
  apiName,
  apiCall,
  initialResultData = null,
  resultParser = null,
}) => {
  const { addSystemError } = useNotifications();
  const [apiState, setState] = useState({});

  const setApiState = ({ reqState, result = undefined }) =>
    setState((prev) => {
      debug('setApiState', { prev });
      return createApiState({ ...prev, reqState, result });
    });

  // Build initial state
  debug('useApiReq', { apiState });

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
    setState(createApiState(apiState));
  }, [apiState.apiName]);

  return createStatefullApi(apiState);
};

export { useApiReq, getResultFieldErrors };
