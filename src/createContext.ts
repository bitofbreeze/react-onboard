import React from 'react';

/**
 * Type-safe createContext
 */
export const createContext = <ContextType>(): [() => ContextType, React.Provider<ContextType | undefined>] => {
  const Context = React.createContext<ContextType | undefined>(undefined);

  const useContext = () => {
    const value = React.useContext(Context);

    if (value === undefined) { throw new Error('useContext must be used within a Provider with a value'); }

    return value;
  };
  return [useContext, Context.Provider];
};
