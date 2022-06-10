import React, { FC, useEffect, useState } from 'react';

import { BlAccordion } from 'buflib';

const ApiList = ({ apis }): FC => {
  const [results, setResults] = useState({});

  async function makeCall(name, call) {
    const result = await call();
    setResults((prev) => ({
      ...prev,
      [name]: result,
    }));
  }

  return (
    <div>
      {Object.entries(apis).map(([name, call]) => (
        <div key={name} className="bl-p-y-2">
          <button
            className="bl-button bl-button--primary bl-button--fluid"
            onClick={() => makeCall(name, call)}
          >
            {name}
          </button>
          {results[name] ? (
            <pre className="bl-bg-ocre-4 bl-p-a-4">
              {JSON.stringify(results[name], null, 2)}
            </pre>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export { ApiList };
