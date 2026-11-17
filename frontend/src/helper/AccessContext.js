import { createContext, useContext } from 'react';

export const AccessContext = createContext(null);
export const useAccessUser = () => useContext(AccessContext);
