import { useEffect, useState } from 'react';
import slugify from 'slugify';

import { IDLE, PENDING } from '../constants/fetchStates';
import { ERROR, MESSAGE, WARNING } from '../constants/systemNotificationTypes';
import { logError } from '../helpers/logError';
import { createDebugger } from '../helpers/createDebugger';

import { useNotifications } from './useNotifications';

const debug = createDebugger(__filename);

const hyphenToCamelCase = (str) => {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

const createAbortController: AbortController = () => {
  const { AbortController } = window;
  return new AbortController();
};

let apiStore = IDLE;

const resultParsers = {
  default: async (response) => {
    // NOTE! `!response.ok` is assumed to be `json()`-able, otherwise treat as a system exception
    const resolved = await response.json();
    return resolved;
  },
};

const apiWrapper = ({ apiName, apiCall }) => {
  return async (...args) => {
    const signal = args.find((arg) => arg instanceof AbortSignal) || {};

    let response;
    let result;

    try {
      response = await apiCall(...args);

      result = resultParsers[apiName]
        ? await resultParsers[apiName](response)
        : await resultParsers.default(response);

      if (result.errors) {
        result.meta.type = WARNING;
      }
    } catch (err) {
      result = { meta: { success: false } };
      result.errors = [];
      if (signal.aborted) {
        result.meta.type = WARNING;
        result.errors.push(`Request cancelled (${apiName})`);
      } else {
        result.meta.type = ERROR;
        result.errors.push(err.toString());
      }
      logError(err);
    }

    return result;
  };
};

const fetchApis = async () => {
  const getApis = apiWrapper({
    apiName: 'initApis',
    apiCall: () => fetch('/api'),
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
        });
      });
    }
    return acc;
  }, {});
};

const useApi = () => {
  const { addSystemError } = useNotifications();
  const [apis, setApis] = useState({});
  useEffect(() => {
    if (apiStore === IDLE) {
      apiStore === PENDING;
      fetchApis(addSystemError).then((apis) => {
        apiStore = apis;
        setApis(apiStore);
      });
    }
  }, []);
  return apis;
};

export { useApi };
