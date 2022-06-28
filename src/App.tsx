import React, { FC } from 'react';
import { createRoot } from 'react-dom/client';

import { BlInfoBox } from 'buflib';

import { AppContextProvider } from './components/app-context/AppContext';
import { Notifications } from './components/notifications/Notifications';
import { Driver } from './components/driver/Driver';

import 'feather-icons';
import './styles/index.scss';

import { createDebugger } from './helpers/createDebugger';

const debug = createDebugger(__filename);

const App = (): FC => {
  return (
    <AppContextProvider>
      <Notifications />
      <div className="bl-container bl-container--small bl-bg-violet-3 bl-p-a-2">
        <div className="bl-grid bl-grid--two-columns bl-m-b-2">
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
        <div className="bl-m-b-2">
          <BlInfoBox header="Fetch Api">
            <p>
              The Promise returned from fetch() won't reject on HTTP error
              status even if the response is an HTTP 404 or 500. Instead, as
              soon as the server responds with headers, the Promise will resolve
              normally (with the ok property of the response set to false if the
              response isn't in the range 200–299), and it will only reject on
              network failure or if anything prevented the request from
              completing.
            </p>
          </BlInfoBox>
        </div>
        <Driver />
      </div>
    </AppContextProvider>
  );
};

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
