import { useEffect, useState } from 'react';
import slugify from 'slugify';

import { useAppContext } from './useAppContext';
import { useNotifications } from './useNotifications';

import { logError } from '../helpers/logError';
import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const hyphenToCamelCase = (str) => {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

const MODULE = {
  apiStore: null,
  setApiCallState: null,
  notifications: null,
};

const FETCH_STATES = Object.freeze({
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
});

const fetchStateProxyHandler = {
  get(target, prop) {
    switch (prop) {
      // Methods
      case 'call':
        return target.apiCall;
      // Props
      case 'isIdle':
        return target.fetchState === FETCH_STATES.IDLE;
      case 'isPending':
        return target.fetchState === FETCH_STATES.PENDING;
      case 'isSuccess':
        return target.fetchState === FETCH_STATES.SUCCESS;
      case 'isFailed':
        return target.fetchState === FETCH_STATES.FAILED;
      default:
        return target[prop];
    }
  },
  set(target, prop, value) {
    switch (prop) {
      /* eslint-disable no-return-assign */
      /* eslint-disable no-param-reassign */
      case 'data':
        return (target.data = value);
      /* eslint-disable no-return-assign */
      /* eslint-disable no-param-reassign */
      default:
        throw new Error(`Unknown prop '${prop}`);
    }
  },
};

const createApiProxy = (apiCall, { fetchState, data } = {}) => {
  return new Proxy(
    {
      apiCall,
      data: data || null,
      fetchState: fetchState || FETCH_STATES.IDLE,
    },
    fetchStateProxyHandler,
  );
};

const resultParsers = {
  /*
  example: async (response) => {
    const resolved = await response.json();
    return resolved;
  },
  */
};

const getWrappedApiCall = ({ apiName, apiCall }) => {
  const { addSystemError } = MODULE.notifications;
  const { location } = window;
  const typeUrlBase = `${location.protocol}://${location.host}/error-type`;

  return async (...args) => {
    const signal = args.find((arg) => arg instanceof AbortSignal) || {};

    let response;
    let result;

    MODULE.setApiCallState(apiName, { fetchState: FETCH_STATES.PENDING });
    try {
      response = await apiCall(...args);

      result = resultParsers[apiName]
        ? await resultParsers[apiName](response)
        : await response.json();

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

    debug('getWrappedApiCall', { result });

    MODULE.setApiCallState(apiName, {
      fetchState: FETCH_STATES[result.meta.success ? 'SUCCESS' : 'FAILED'],
      data: result,
    });

    return result;
  };
};

const getCustomApiCalls = () => ({
  getTextContent: getWrappedApiCall({
    apiName: 'getTextContent',
    apiCall: () => fetch('/'),
  }),
  nonExistingUrl: getWrappedApiCall({
    apiName: 'nonExistingUrl',
    apiCall: () => fetch('/flemming'),
  }),
});

const fetchApiRoutes = async () => {
  const getApis = getWrappedApiCall({
    apiName: 'initApis',
    apiCall: () => fetch('/api'),
  });

  const { data: apiRoutes } = await getApis();

  return apiRoutes;
};

const createApiCallsFromRoutes = (apiRoutes) => {
  const apiCalls = apiRoutes.reduce((acc, { path, methods }) => {
    debug('fetchApis', path);
    if (path !== '/') {
      Object.keys(methods).forEach((method) => {
        const apiName = hyphenToCamelCase([method, slugify(path)].join('-'));
        acc[apiName] = getWrappedApiCall({
          apiName,
          apiCall: () => fetch(`/api${path}`, { method }),
        });
      });
    }
    return acc;
  }, getCustomApiCalls());

  return apiCalls;
};

const useApi = () => {
  // eslint-disable-next-line no-unused-vars
  const [{ apiStates }, setAppState] = useAppContext();
  const [apis, setApis] = useState(MODULE.apiStore || {});

  // `setApiCallState` is defined on module scope
  MODULE.notifications = useNotifications();
  MODULE.setApiCallState = (apiName, { fetchState, data = undefined }) =>
    setAppState((prev) => {
      const prevApiStates = prev?.apiStates || {};
      const prevApiState = prevApiStates[apiName] || {};
      const next = {
        ...prev,
        apiStates: {
          ...prevApiStates,
          [apiName]: {
            ...prevApiState,
            fetchState,
            data: data || fetchState.data,
          },
        },
      };
      debug('setApiCallState', { prev, next });
      return next;
    });

  useEffect(() => {
    if (!MODULE.apiStore) {
      // Only run once on module loaded
      fetchApiRoutes()
        .then(createApiCallsFromRoutes)
        .then((apiCalls) => {
          // Store the `apiCalls` to only do this once for the App <= TODO! Not working
          MODULE.apiStore = apiCalls;
          debug('apiStore', MODULE.apiStore);
          setApis(apiCalls);
        });
    }
  }, []);

  // Every time, re-wrap the apis and their the updated state in the proxy
  const statefulApis = Object.entries(apis).reduce(
    (acc, [apiName, apiCall]) => ({
      ...acc,
      [apiName]: createApiProxy(apiCall, apiStates[apiName]),
    }),
    {},
  );

  return statefulApis;
};

export { useApi };
