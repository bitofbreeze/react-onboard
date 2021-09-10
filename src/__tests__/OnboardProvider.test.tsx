import React, { useState } from 'react';
import {
  render, screen, fireEvent, waitForElementToBeRemoved,
} from '@testing-library/react';
import { OnboardElement, OnboardProvider } from '..';

test('Onboard message is shown when it does not depend on any elements and can be dismissed directly', async () => {
  const Component = () => {
    const [message, setMessage] = useState<React.ReactNode>(null);

    return (
      <OnboardProvider
        messages={[{
          id: 'this is a welcome',
          children: <div>this is a welcome</div>,
        }]}
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events
        showCallback={({ children, onAck }) => { setMessage(<div role="button" data-testid="message" onClick={onAck}>{children}</div>); }}
        ackCallback={() => { setMessage(null); }}
        HighlightComponent={null}
      >
        {message}
      </OnboardProvider>
    );
  };

  render(<Component />);

  const message = await screen.findByTestId('message');
  expect(message.textContent).toBe('this is a welcome');
  fireEvent.click(message);
  expect(screen.queryByTestId('message')).toBeNull();
});

test('Onboard message is shown when it depends on an already present element and can be dismissed by clicking element', async () => {
  const Component = () => {
    const [message, setMessage] = useState<React.ReactNode>(null);

    return (
      <OnboardProvider
        messages={[{
          id: 'this is a welcome with an element',
          children: <div>this is a welcome with an element</div>,
          elementIds: ['welcome element'],
        }]}
        showCallback={({ children }) => { setMessage(<div data-testid="message">{children}</div>); }}
        ackCallback={() => { setMessage(null); }}
        HighlightComponent={({ children, ...rest }) => <div data-testid="highlight-component" {...rest}>{children}</div>}
      >
        <OnboardElement id="welcome element">
          <div>WELCOME</div>
        </OnboardElement>
        {message}
      </OnboardProvider>
    );
  };

  render(<Component />);

  const message = await screen.findByTestId('message');
  expect(message.textContent).toBe('this is a welcome with an element');

  const highlightComponent = screen.getByTestId('highlight-component');
  fireEvent.click(highlightComponent);
  expect(screen.queryByTestId('message')).toBeNull();
});
