import React, { FC, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { BlInfoBox } from 'buflib';

import { useApi } from './useHooks/useApi';

import { AppContextProvider } from './components/app-context/AppContext';
import { Notifications } from './components/notifications/Notifications';
import { ApiList } from './components/api-list/ApiList';

import './styles/index.scss';

import { createDebugger } from './helpers/createDebugger';

const debug = createDebugger(__filename);

const App = (): FC => {
  const apis = useApi();

  debug('render', { apis });

  return (
    <div className="bl-container bl-container--small">
      <AppContextProvider>
        <Notifications />
        <div className="bl-grid bl-grid--two-columns-mobile">
          <BlInfoBox header="JSON API">
            <p>
              Truly generic problems -- i.e., conditions that could potentially
              apply to any resource on the Web -- are usually better expressed
              as plain status codes.
            </p>
          </BlInfoBox>
          <BlInfoBox header="ProblemDetails">
            <p>
              For example, a "write access disallowed" problem is probably
              unnecessary, since a 403 Forbidden status code in response to a
              PUT request is self-explanatory.
            </p>
          </BlInfoBox>
        </div>
        <ApiList apis={apis} />
      </AppContextProvider>
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
