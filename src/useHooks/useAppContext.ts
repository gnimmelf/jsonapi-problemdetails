import { useContext, ContextType } from 'react';

import { AppContext } from '../components/app-context/AppContext';

import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

const useAppContext: ContextType = () => {
  const appContext = useContext(AppContext);
  debug('useAppContext', { appContext });
  return appContext;
};

export { useAppContext };
