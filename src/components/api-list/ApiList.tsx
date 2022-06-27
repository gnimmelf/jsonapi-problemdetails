import React, { FC, useEffect, useState } from 'react';

import { useApi } from '../../useHooks/useStatefullApi';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const ApiList = (): FC => {
  const apis = useApi();

  const [isOpenStates, setIsOpenStates] = useState({});

  const setApiNameOpenState = (apiName, isOpen) =>
    setIsOpenStates((prev) => ({
      ...prev,
      [apiName]: isOpen,
    }));

  async function makeCall(apiName) {
    setApiNameOpenState(apiName, true);
    await apis[apiName].call();
  }

  debug('render', {
    apis,
    isOpenStates,
  });

  return (
    <div>
      {Object.entries(apis).map(([apiName, apiState]) => (
        <div key={apiName} className="bl-p-y-2">
          <button
            type="button"
            disabled={apiState.isPending}
            className="bl-button bl-button--primary bl-button--fluid"
            onClick={() => {
              if (apiState.isIdle) {
                makeCall(apiName);
              } else {
                setApiNameOpenState(apiName, !isOpenStates[apiName]);
              }
            }}
          >
            {apiName}
          </button>
          <div
            className="bl-bg-ocre-4 bl-p-a-4"
            style={{
              display: isOpenStates[apiName] ? 'block' : 'none',
            }}
          >
            {apiState.data && (
              <>
                <pre>{JSON.stringify(apiState.data, null, 2)}</pre>
                <button
                  type="button"
                  disabled={apiState.isPending}
                  className="bl-button bl-button--secondary bl-button--fluid"
                  onClick={() => makeCall(apiName)}
                >
                  Reload
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export { ApiList };
