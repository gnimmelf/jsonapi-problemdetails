import { useEffect } from 'react';

import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';

import {
  API_STATES,
  createStatefullApi,
  createApiStateValue,
} from '../lib/statefullApi';

import { logError } from '../helpers/logError';
import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const createApiCallWrapper = ({
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

      result = await (resultParser ? resultParser(response) : response.json());

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
      reqState: API_STATES.DONE,
      result,
    });

    return result;
  };
};

const createSetApiState =
  ({ apiName, apiStateValue, setAppState }) =>
  ({ reqState, result = undefined }) => {
    setAppState((prev) => {
      // On first run `prev.apiStates` does not exist
      const prevApiStates = prev?.apiStates || {};

      // The next state for this `apiName`
      const nextApiState = {
        ...(prevApiStates[apiName] || apiStateValue),
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

const useApi = ({
  apiName,
  apiCall,
  initialValue = null,
  resultParser = null,
}) => {
  const notifications = useNotifications();
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
    setApiState,
    notifications,
  });

  useEffect(() => {
    if (!apiStateValue.apiCall) {
      // On initial `apiState`, the callWrapper has not yet been setOn the state value object
      debug(`Should only happen once for '${apiName}'!`);
      apiStateValue.apiCall = apiCallWrapper;
      setApiState(apiStateValue);
    }
  }, []);

  return createStatefullApi(apiStateValue);
};

export { useApi };
