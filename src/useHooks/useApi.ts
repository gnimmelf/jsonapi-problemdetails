import { useEffect, useState } from 'react';
import slugify from 'slugify';

import { useNotifications } from './useNotifications';

import { logError } from '../helpers/logError';
import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const hyphenToCamelCase = (str) => {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

let apiStore = null;

const resultParsers = {
  /*
  example: async (response) => {
    const resolved = await response.json();
    return resolved;
  },
  */
};

const apiWrapper = ({ apiName, apiCall, notifications }) => {
  const { addSystemError } = notifications;
  const { location } = window;
  const typeUrlBase = `${location.protocol}://${location.host}/error-type`;

  return async (...args) => {
    const signal = args.find((arg) => arg instanceof AbortSignal) || {};

    let response;
    let result;

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

    return result;
  };
};

const getCustomApis = (notifications) => ({
  getTextContent: apiWrapper({
    apiName: 'getTextContent',
    apiCall: () => fetch('/'),
    notifications,
  }),
  nonExistingUrl: apiWrapper({
    apiName: 'nonExitingUrl',
    apiCall: () => fetch('/flemming'),
    notifications,
  }),
});

const fetchApis = async (notifications) => {
  const getApis = apiWrapper({
    apiName: 'initApis',
    apiCall: () => fetch('/api'),
    notifications,
  });

  const { data: routes } = await getApis();

  return routes.reduce((acc, { path, methods }) => {
    debug('fetchApis', path);
    if (path !== '/') {
      Object.keys(methods).forEach((method) => {
        const apiName = hyphenToCamelCase([method, slugify(path)].join('-'));
        acc[apiName] = apiWrapper({
          apiName,
          apiCall: () => fetch(`/api${path}`, { method }),
          notifications,
        });
      });
    }
    return acc;
  }, getCustomApis(notifications));
};

const useApi = () => {
  const notifications = useNotifications();
  const [apis, setApis] = useState(apiStore || {});

  useEffect(() => {
    if (!apiStore) {
      fetchApis(notifications).then((wrappedApis) => {
        apiStore = wrappedApis;
        debug('useApi', { apis, apiStore });
        setApis(wrappedApis);
      });
    }
  }, []);

  return apis;
};

export { useApi };
