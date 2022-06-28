import { useState, useEffect } from 'react';

import {
  createApiCallWrapper,
  getResultFieldErrors,
} from '../lib/createApiCallWrapper';
import {
  API_REQ_STATES,
  createApiReqProxy,
  createApiReqState,
} from '../lib/apiReqState';

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
  const [apiReqState, setState] = useState({});

  const setApiReqState = ({ reqState, result = undefined }) =>
    setState((prev) => {
      debug('setApiReqState', { prev });
      return createApiReqState({ ...prev, reqState, result });
    });

  // Build initial state
  debug('useApiReq', { apiReqState });

  if (apiReqState.apiName !== apiName) {
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
      apiReqState,
      createApiReqState({
        apiName,
        apiCall: wrappedApiCall,
        result: { data: initialResultData },
      }),
    );
  }

  useEffect(() => {
    // Insert the first state for this api
    setState(createApiReqState(apiReqState));
  }, [apiReqState.apiName]);

  return createApiReqProxy(apiReqState);
};

export { useApiReq, getResultFieldErrors };
