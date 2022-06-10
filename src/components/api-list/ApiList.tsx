import React, { FC, useEffect, useState } from 'react';

import { BlAccordion } from 'buflib';

import { IDLE, PENDING } from '../../constants/fetchStates';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const CLOSED = false;
const OPEN = true;

const ApiList = ({ apis }): FC => {
  const [results, setResults] = useState({});
  const [states, setStates] = useState({});

  async function makeCall(name, call) {
    setStates((prev) => ({
      ...prev,
      [name]: PENDING,
    }));
    const result = await call();
    setResults((prev) => ({
      ...prev,
      [name]: result,
    }));
    setStates((prev) => ({
      ...prev,
      [name]: OPEN,
    }));
  }

  useEffect(() => {
    setStates(
      Object.keys(apis).reduce(
        (acc, name) => ({
          ...acc,
          [name]: IDLE,
        }),
        {}
      )
    );
  }, [apis]);

  debug('render', { states, results });

  return (
    <div>
      {Object.entries(apis).map(([name, call]) => (
        <div key={name} className="bl-p-y-2">
          <button
            disabled={states[name] === PENDING}
            className="bl-button bl-button--primary bl-button--fluid"
            onClick={() => {
              if (states[name] === IDLE) {
                makeCall(name, call);
              } else if (states[name] !== PENDING) {
                setStates((prev) => ({
                  ...prev,
                  [name]: !states[name],
                }));
              }
            }}
          >
            {name}
          </button>
          <div
            className="bl-bg-ocre-4 bl-p-a-4"
            style={{ display: states[name] === OPEN ? 'block' : 'none' }}
          >
            {results[name] && (
              <pre>{JSON.stringify(results[name], null, 2)}</pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export { ApiList };
