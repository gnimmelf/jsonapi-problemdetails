import React, { FC, useEffect, useState, useRef } from 'react';

import { useApi } from '../../useHooks/useApi';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const ApiTest: FC = () => {
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

  debug('render', { apis });

  return (
    <>
      <h1>ApiTest</h1>
      {apis.map((api, idx) => (
        <div key={`key-${idx}`}>
          {api.isIdle && <div>Not called yet</div>}
          {api.isPending && <div>Calling...</div>}
          {api.isDone && <div>Allredy called</div>}
          <button
            type="button"
            disabled={api.isPending}
            onClick={() => {
              api.call();
            }}
          >
            {api.apiName}
          </button>
          <pre>{JSON.stringify(api, null, 2)}</pre>
        </div>
      ))}
    </>
  );
};

export { ApiTest };
