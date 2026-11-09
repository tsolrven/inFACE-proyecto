import { createContext, useContext } from 'react';

export const AutorDestacadoContext = createContext(null);

export const useAutorDestacado = () => useContext(AutorDestacadoContext);
