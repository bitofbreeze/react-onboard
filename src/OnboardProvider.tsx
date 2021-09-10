import React, { useState, useEffect, FC } from 'react';
import { createContext } from './createContext';
import { useLocalStorage } from './useLocalStorage';
import {
  OnboardContext, Message, ShowCallback, AckCallback,
} from './types';

const [useOnboard, OnboardContextProvider] = createContext<OnboardContext>();

const useOnboardProvider = (
  messages: Array<Message>,
  showCallback: ShowCallback,
  ackCallback: AckCallback,
  HighlightComponent: React.FC,
) => {
  // Set of names of messages that have been seen
  const [messagesAcked, setMessagesAcked] = useLocalStorage<Array<string>>(
    'messagesAcked',
    [],
  );
  // All elements currently rendered
  const [renderedElements, setRenderedElements] = useState<Array<string>>([]);
  // Source of truth
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);

  const ackMessage = (id: string) => {
    // This is called twice in some configs because clicking element highlight calls it and then dismissing the message from that calls it again
    if (id != null && !messagesAcked.includes(id)) {
      setMessagesAcked([...messagesAcked, id]);
      return true;
    }
    return false;
  };

  // When a message is acked, execute ackCallback and then unset active message
  useEffect(() => {
    if (
      activeMessage !== null
      && activeMessage.id === messagesAcked[messagesAcked.length - 1]
    ) {
      ackCallback({ messageId: activeMessage.id });
      setActiveMessage(null);
    }
  }, [messagesAcked]);

  // When active message has been unset or a new element used in some message renders, show another
  useEffect(() => {
    // Tells us if one of the dependencies changed or component was unmounted to avoid race
    let didCancel = false;

    if (activeMessage === null && !didCancel) {
      messages
        .filter(({ id }) => !messagesAcked.includes(id))
        .some(({
          id, children, elementIds, delay,
        }) => {
          const unrenderedElements = elementIds?.filter(
            (elementId) => !renderedElements.includes(elementId),
          );
          // Show message if it has no associated elements or all are shown at the same time
          if (
            unrenderedElements === undefined
            || unrenderedElements.length === 0
          ) {
            setTimeout(
              () => setActiveMessage({ id, elementIds, children }),
              delay ?? 0,
            );
            return true;
          }
          return false;
        });
    }

    return () => {
      didCancel = true;
    };
  }, [activeMessage, renderedElements]);

  // When active message has been set, execute its showCallback
  useEffect(() => {
    if (activeMessage !== null) {
      showCallback({
        messageId: activeMessage.id,
        children: activeMessage.children,
        onAck: () => ackMessage(activeMessage.id),
      });
    }
  }, [activeMessage]);

  return {
    activeMessage,
    onElementRender: (elementId: string) => {
      if (!renderedElements.includes(elementId)) {
        setRenderedElements((elements) => [...elements, elementId]);
      }
    },
    onElementUnrender: (elementId: string) => {
      setRenderedElements((elements) => elements.filter((element) => element !== elementId));
    },
    ackMessage,
    HighlightComponent,
  };
};

export const OnboardProvider: FC<{
  messages: Array<Message>
  showCallback: ShowCallback
  ackCallback: AckCallback
  HighlightComponent: React.FC
}> = ({
  children,
  messages,
  showCallback,
  ackCallback,
  HighlightComponent,
}) => {
  const value = useOnboardProvider(
    messages,
    showCallback,
    ackCallback,
    HighlightComponent,
  );
  return (
    <OnboardContextProvider value={value}>{children}</OnboardContextProvider>
  );
};

export { useOnboard };
