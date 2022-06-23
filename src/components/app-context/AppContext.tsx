import React, { createContext, useState, useMemo, ReactNode } from 'react';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

// create context
const AppContext = createContext();

const initialState = {
  systemNotifications: [],
};

const AppContextProvider: ReactNode = ({ children }) => {
  const [state, setAppState] = useState(initialState);

  const stateString = JSON.stringify(state);

  debug('AppContextProvider', { state });
  // debug('AppContextProvider', JSON.stringify(state, null, 2));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const store = useMemo(() => [state, setAppState], [stateString]);

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

export { AppContext, AppContextProvider, initialState };
