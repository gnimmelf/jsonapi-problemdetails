import { useEffect, useState } from 'react';
import slugify from 'slugify';

import { useNotifications } from './useNotifications';

import { ERROR, WARNING } from '../constants/systemNotificationTypes';
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
  default: async (response) => {
    // NOTE! `!response.ok` is assumed to be `json()`-able, otherwise treat as a system exception
    const resolved = await response.json();
    return resolved;
  },
};

const apiWrapper = ({ apiName, apiCall, addSystemNotification }) => {
  return async (...args) => {
    const signal = args.find((arg) => arg instanceof AbortSignal) || {};

    let response;
    let result;

    try {
      response = await apiCall(...args);

      result = resultParsers[apiName]
        ? await resultParsers[apiName](response)
        : await resultParsers.default(response);

      debug('fetchParsed', { response, result });
    } catch (err) {
      result = { meta: { catchBlockError: true } };
      if (signal.aborted) {
        result.meta.type = WARNING;
        result.title = 'Request was cancelled';
        result.details = `Request for (${apiName}) was aborted by signal`;
      } else {
        result.meta.type = ERROR;
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
      success: response.status === 200,
    });

    if (response.status >= 500 || result.meta.type === ERROR) {
      addSystemNotification({
        message: 'Something went wrong!',
        type: ERROR,
      });
    }

    return result;
  };
};

const fetchApis = async (addSystemNotification) => {
  const getApis = apiWrapper({
    apiName: 'initApis',
    apiCall: () => fetch('/api'),
    addSystemNotification,
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
          addSystemNotification,
        });
      });
    }
    return acc;
  }, {});
};

const useApi = () => {
  const { addSystemNotification } = useNotifications();
  const [apis, setApis] = useState(apiStore || {});

  useEffect(() => {
    if (!apiStore) {
      fetchApis(addSystemNotification).then((wrappedApis) => {
        apiStore = wrappedApis;
        setApis(wrappedApis);
      });
    }
  }, []);

  debug('useApi', { apis, apiStore });

  return apis;
};

export { useApi };
