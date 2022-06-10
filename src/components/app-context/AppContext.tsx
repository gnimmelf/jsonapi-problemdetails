import React, { createContext, useState, useMemo, ReactNode } from 'react';

import { IDLE } from '../../constants/fetchStates';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

// create context
const AppContext = createContext();

const createFetchState = (value) => ({
  value,
  fetchState: IDLE,
});

const initialState = {
  systemNotifications: [],
};

const AppContextProvider: ReactNode = ({ children }) => {
  const [state, setAppState] = useState(initialState);

  const stateString = JSON.stringify(state);

  debug('AppContextProvider', { state });
  // debug('AppContextProvider', stateString);

  const store = useMemo(() => [state, setAppState], [stateString]);

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

export { AppContext, AppContextProvider, initialState };
