import { useEffect } from 'react';

import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';

import {
  API_STATES,
  createStatefullApi,
  createApiState,
} from '../lib/statefullApi';

import { logError } from '../helpers/logError';
import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const createEnhancedApiCall = ({
  apiName,
  apiCall,
  resultParser,
  setApiState,
  notifications,
}) => {
  const { addSystemError } = notifications;
  const { location } = window;
  const typeUrlBase = `${location.protocol}://${location.host}/error-type`;

  return async (...args) => {
    const signal = args.find((arg) => arg instanceof AbortSignal) || {};

    let response;
    let result;

    setApiState({ reqState: API_STATES.PENDING });

    try {
      response = await apiCall(...args);

      result = resultParser ? resultParser(response) : await response.json();

      debug('fetchParsed', { response, result });
    } catch (err) {
      result = { meta: { catchBlockError: true } };
      if (signal.aborted) {
        result.type = `${typeUrlBase}/request-aborted`;
        result.title = 'Request was cancelled';
        result.details = `Request for (${apiName}) was aborted by signal`;
      } else {
        result.type = `${typeUrlBase}/response-parsing-error`;
        result.title = 'Client side parsing error';
        result.details = err.toString();
      }
    }

    if (!result.meta) {
      result.meta = {};
    }

    Object.assign(result.meta, {
      url: response.url,
      status: response.status,
      success: !result.meta.catchBlockError && response.status === 200,
    });

    if (
      !result.meta.success &&
      (result.meta.status >= 500 ||
        result.type.endsWith('response-parsing-error'))
    ) {
      result.meta.isRuntimeException = true;
      addSystemError(`[Beskrivelse for "${result.type}"]`);
      logError(result);
    }

    debug(`enhancedApiCall:${apiName}`, { result });

    setApiState({
      reqState: API_STATES[result.meta.success ? 'SUCCESS' : 'FAILED'],
      result,
    });

    return result;
  };
};

const createSetApiState =
  ({ apiName, apiState, setAppState }) =>
  ({ reqState, result = undefined }) => {
    setAppState((prev) => {
      const prevApiStates = prev?.apiStates || {};
      const prevApiState = prevApiStates[apiName] || apiState;
      const next = {
        ...prev,
        apiStates: {
          ...prevApiStates,
          [apiName]: {
            ...prevApiState,
            reqState,
            result: result || apiState.result,
          },
        },
      };
      debug('setApiState', { prev, next });
      return next;
    });
  };

const useApi = ({
  apiName,
  apiCall,
  initialValue = null,
  resultParser = null,
}) => {
  const notifications = useNotifications();
  const [{ apiStates }, setAppState] = useAppContext();

  // Get current or create a new `apiState` object
  let apiState = (apiStates || {})[apiName];
  if (!apiState) {
    apiState = createApiState({
      apiName,
      result: initialValue,
    });
  }

  const setApiState = createSetApiState({ apiName, apiState, setAppState });

  debug('apiState.apiCall', apiState.apiCall);

  const enhancedApiCall = createEnhancedApiCall({
    apiName,
    apiCall,
    resultParser,
    setApiState,
    notifications,
  });

  useEffect(() => {
    if (!apiState.apiCall) {
      debug(`Should only happen once for '${apiName}'!`);
      apiState.apiCall = enhancedApiCall;
      setApiState(apiState);
    }
  }, []);

  return createStatefullApi(apiState);
};

export { useApi };
