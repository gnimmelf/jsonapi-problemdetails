import React, { FC, useEffect, useState, useRef } from 'react';

import { useApi } from '../../useHooks/useApi';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const ApiTest: FC = () => {
  const apiLog = useRef([]);

  const [selectedApiName, setSelectedApiName] = useState(null);

  const apis = [
    useApi({
      apiName: 'succes-data',
      apiCall: () => fetch('/api/success-data'),
      initialValue: { data: [] },
    }),
    useApi({
      apiName: 'badrequest',
      apiCall: () => fetch('/api/badrequest'),
    }),
    useApi({
      apiName: 'division-by-zero',
      apiCall: () => fetch('/api/division-by-zero'),
    }),
  ];

  if (selectedApiName) {
    apiLog.current = apiLog.current.concat(
      JSON.stringify(
        apis.find(({ apiName }) => apiName === selectedApiName),
        null,
        2,
      ),
    );
  }

  debug('render', { apis, selectedApiName, log: apiLog.current });

  return (
    <>
      <h1>ApiTest</h1>
      {apis.map((api, idx) => (
        <button
          key={`key-${idx}`}
          type="button"
          disabled={api.isPending}
          onClick={() => {
            apiLog.current = [JSON.stringify(api, null, 2)];
            setSelectedApiName(api.apiName);
            api.call();
          }}
        >
          {api.apiName}
        </button>
      ))}
      {apiLog.current.map((log, idx) => (
        <pre key={`key-${idx}`}>{log}</pre>
      ))}
    </>
  );
};

export { ApiTest };
