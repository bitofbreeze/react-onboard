import React, { useState, useEffect, FC } from 'react'
import { createContext } from './createContext'
import { useLocalStorage } from './useLocalStorage'
import { Props, Message, ShowCallback, AckCallback } from './types'

const [useOnboard, OnboardContextProvider] = createContext<Props>()

const useOnboardProvider = (
  messages: Array<Message>,
  showCallback: ShowCallback,
  ackCallback: AckCallback,
  HighlightComponent: any
) => {
  // Set of names of messages that have been seen
  const [messagesAcked, setMessagesAcked] = useLocalStorage<Array<string>>(
    `messagesAcked`,
    []
  )
  // All elements currently rendered
  const [renderedElements, setRenderedElements] = useState<Array<string>>([])
  // Source of truth
  const [activeMessage, setActiveMessage] = useState<Message | null>(null)

  const ackMessage = (id: string) => {
    // This is called twice in some configs because clicking element highlight calls it and then dismissing the message from that calls it again
    if (id !== undefined && id !== null) {
      !messagesAcked.includes(id) && setMessagesAcked([...messagesAcked, id])
      if (activeMessage?.id === id) {
        ackCallback({ messageId: activeMessage.id })
        setActiveMessage(null)
      }
    }
  }

  useEffect(() => {
    // Tells us if one of the dependencies changed or component was unmounted to avoid race
    let didCancel = false

    if (activeMessage === null && !didCancel) {
      messages
        .filter(({ id }) => !messagesAcked.includes(id))
        .some(({ id, children, elementIds }) => {
          const unrenderedElements = elementIds?.filter(
            (elementId) => !renderedElements.includes(elementId)
          )
          // Show message if it has no associated elements or all are shown at the same time
          if (
            unrenderedElements === undefined ||
            unrenderedElements.length === 0
          ) {
            setActiveMessage({ id, elementIds, children })
            return true
          }
          return false
        })
    }

    return () => {
      didCancel = true
    }
  }, [activeMessage, renderedElements, messagesAcked]) // Execute when another message has been acked or a new element used in some message renders

  useEffect(() => {
    if (activeMessage !== null) {
      showCallback({
        messageId: activeMessage.id,
        children: activeMessage.children,
        onAck: () => ackMessage(activeMessage.id)
      })
    }
  }, [activeMessage])

  return {
    activeMessage,
    onElementRender: (elementId: string) => {
      if (!renderedElements.includes(elementId)) {
        setRenderedElements([...renderedElements, elementId])
      }
    },
    onElementUnrender: (elementId: string) => {
      setRenderedElements(
        renderedElements.filter((element) => element !== elementId)
      )
    },
    ackMessage,
    HighlightComponent
  }
}

export const OnboardProvider: FC<{
  messages: Array<Message>
  showCallback: ShowCallback
  ackCallback: AckCallback
  HighlightComponent: any
}> = ({
  children,
  messages,
  showCallback,
  ackCallback,
  HighlightComponent
}) => {
  const value = useOnboardProvider(
    messages,
    showCallback,
    ackCallback,
    HighlightComponent
  )
  return (
    <OnboardContextProvider value={value}>{children}</OnboardContextProvider>
  )
}

export { useOnboard }
