import { Dispatch, SetStateAction, useState, useEffect } from 'react'

const isClient = typeof window === 'object'

/**
 * Set and get a value in local storage
 * Inspired by https://github.com/streamich/react-use/blob/master/src/useLocalStorage.ts
 */
export const useLocalStorage = <ValueType>(
  key: string,
  initialValue?: ValueType
): [ValueType, Dispatch<SetStateAction<ValueType>>] => {
  // Only get stored value first render
  const [storedValue, setStoredValue] = useState(() => {
    if (!isClient) {
      return undefined
    }

    try {
      const localStorageValue = window.localStorage.getItem(key)
      // Parse stored JSON, or if none return initialValue
      return localStorageValue === null
        ? initialValue
        : JSON.parse(localStorageValue)
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      // If user is in private mode or has storage restriction
      // localStorage can throw. JSON.stringify can also throw.
      console.error(error)
    }
  }, [storedValue])

  return [storedValue, setStoredValue]
}
