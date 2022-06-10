import { useContext, ContextType } from 'react';

import { AppContext } from '../components/app-context/AppContext';

const useAppContext: ContextType = () => {
  return useContext(AppContext);
};

export { useAppContext };
