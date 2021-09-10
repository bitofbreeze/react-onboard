import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

const Component = ({ storageKey, initialValue }: {storageKey: string, initialValue?: number}) => {
  const [value, setValue] = useLocalStorage(storageKey, initialValue);
  return <button type="button" data-testid="value" onClick={() => setValue((v) => v ? v + 1 : 1)}>{value}</button>;
};

test('useLocalStorage has initial value and can be updated', () => {
  render(<Component storageKey="1" initialValue={1} />);
  const value = screen.getByTestId('value');
  expect(value.textContent).toBe('1');
  fireEvent.click(value);
  expect(value.textContent).toBe('2');
});

test('useLocalStorage has no initial value and can be updated', () => {
  render(<Component storageKey="2" />);
  const value = screen.getByTestId('value');
  expect(value.textContent).toBe('');
  fireEvent.click(value);
  expect(value.textContent).toBe('1');
});
