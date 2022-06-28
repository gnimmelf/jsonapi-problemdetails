import React, { FC, useEffect, useState } from 'react';

import slugify from 'slugify';
import { BlSelect } from 'buflib';

import { createApiCallWrapper } from '../../lib/createApiCallWrapper';

import { useApiReq } from '../../useHooks/useApiReqWithContext';

import { FormTest } from '../form-test/FormTest';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const kebabToCamelCase = (str) =>
  str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });

const customApiCalls = {
  nonExistingUrl: createApiCallWrapper({
    apiName: 'nonExistingUrl',
    apiCall: () => fetch('/flemming'),
  }),
};

const createApiCallsFromRoutes = (apiRoutes = {}) => {
  debug('createApiCallsFromRoutes', { apiRoutes });
  const apiCalls = apiRoutes.reduce((acc, { path, methods }) => {
    debug('createApiCallsFromRoutes', path);
    if (path !== '/') {
      Object.keys(methods).forEach((method) => {
        const apiName = kebabToCamelCase([method, slugify(path)].join('-'));
        acc[apiName] = () => {
          const url = `/api${path}`;
          debug(`Calling ${method} ${url}`);
          return fetch(url, { method });
        };
      });
    }
    return acc;
  }, customApiCalls);

  return apiCalls;
};

const Driver: FC = () => {
  const [selectedApiName, setSelectedApiName] = useState();

  const apisReq = useApiReq({
    apiName: 'getApiRoutes',
    apiCall: () => fetch('/api'),
    resultParser: async (response) => {
      const result = await response.json();
      debug('resultParser', { result });
      return {
        ...result,
        data: createApiCallsFromRoutes(result.data),
      };
    },
    initialResultData: {},
  });

  useEffect(() => {
    apisReq.call();
  }, []);

  useEffect(() => {
    if (apisReq.isDone) {
      setSelectedApiName(Object.keys(apisReq.result.data)[0]);
    }
  }, [apisReq.isDone]);

  const selectedApiCall = selectedApiName
    ? apisReq.result.data[selectedApiName]
    : null;

  debug('render', { apisReq, selectedApiCall, selectedApiName });

  return (
    apisReq.isDone && (
      <>
        <div className=" bl-grid__full bl-text-center bl-m-b-2">
          <BlSelect
            value={selectedApiName}
            className="bl-p-a-1"
            onChange={({ target }) => {
              setSelectedApiName(target.value);
            }}
          >
            {Object.keys(apisReq.result.data).map((apiName) => (
              <option key={apiName} value={apiName}>
                {apiName}
              </option>
            ))}
          </BlSelect>
        </div>
        {selectedApiName && (
          <FormTest
            apiName={selectedApiName}
            apiCall={selectedApiCall}
            onDone={(res) => {
              debug('onDone', { res });
            }}
          />
        )}
      </>
    )
  );
};

export { Driver };
