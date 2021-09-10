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
          id: '1',
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
