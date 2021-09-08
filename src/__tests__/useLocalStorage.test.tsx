import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useLocalStorage } from "../useLocalStorage";

const Component = () => {
  const [value, setValue] = useLocalStorage('test', 1);
  return <div data-testid="value" onClick={() => setValue(v => v + 1)}>{value}</div>;
}

test("useLocalStorage has initial value and can be updated", () => {
  render(<Component />);
  const value = screen.getByTestId('value');
  expect(value.textContent).toBe("1");
  fireEvent.click(value);
  expect(value.textContent).toBe("2");
});
