import { createContext, useContext } from 'react';

export const AccessContext = createContext(null);
export const useAccessUser = () => useContext(AccessContext);

export const UpdateAccessUserContext = createContext(() => {});
export const useUpdateAccessUser = () => useContext(UpdateAccessUserContext);
