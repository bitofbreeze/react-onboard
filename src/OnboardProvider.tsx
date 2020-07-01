import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  FC,
  ReactNode
} from 'react'
import { createContext } from './createContext'
import { useLocalStorage } from './useLocalStorage'

// An action to toggle if a message is seen
type Toggle = Dispatch<SetStateAction<boolean>>

interface Props {
  activeMessageId?: string
  // Allows us to keep track of elements wrapped with OnboardElement
  // elementId allows element to be used in messages (it is the linking mechanism)
  addToggle: (elementId: string, toggle: Toggle) => void
  ackMessage: (id: string) => void
  HighlightElement: any
}

const [useOnboard, OnboardContextProvider] = createContext<Props>()

export interface Message {
  // Unique name to record if the message has been seen
  readonly id: string
  // Array of names of onboard elements to highlight when message is shown
  readonly elementIds?: Array<string>
  readonly children: ReactNode
  // Any specific conditions required before showing the message
  // readonly render?: boolean;
}

type ShowCallback = ({
  messageId,
  children,
  onAck
}: {
  messageId: string
  children: ReactNode
  onAck: () => void
}) => void

type AckCallback = ({ messageId }: { messageId: string }) => void

const useOnboardProvider = (
  messages: Array<Message>,
  showCallback: ShowCallback,
  ackCallback: AckCallback,
  HighlightElement: any
) => {
  // Set of names of messages that have been seen
  const [messagesAcked, setMessagesAcked] = useLocalStorage<Array<string>>(
    `messagesAcked`,
    []
  )
  // All toggles for highlights on elements (one for every use of OnboardElement)
  const [allToggles, setAllToggles] = useState<{ [key: string]: Toggle }>({})
  // Source of truth
  const [activeMessage, setActiveMessage] = useState<{
    id: string
    toggles?: Toggle[]
    children: ReactNode
  } | null>()

  const ackMessage = (id: string) => {
    // This is called twice in some configs because clicking element highlight calls it and then dismissing the message from that calls it again
    !messagesAcked.includes(id) && setMessagesAcked([...messagesAcked, id])
    if (activeMessage?.id === id) {
      activeMessage?.toggles?.map((toggle) => {
        toggle(false)
      })
      ackCallback({ messageId: activeMessage.id })
      setActiveMessage(null)
    }
  }

  useEffect(() => {
    // Tells us if one of the dependencies changed or component was unmounted to avoid race
    let didCancel = false

    if ((activeMessage === undefined || activeMessage === null) && !didCancel) {
      messages
        .filter(({ id }) => !messagesAcked.includes(id))
        .some(({ id, children, elementIds }) => {
          const toggles = elementIds?.map((elementId) =>
            eval(`allToggles.${elementId}`)
          )
          // Show message if it has no associated elements or all are shown at the same time
          if (
            toggles === undefined ||
            toggles === [] ||
            toggles.filter((toggle) => toggle === undefined).length === 0
          ) {
            setActiveMessage({ id, toggles, children })
            return true
          }
          return false
        })
    }

    return () => {
      didCancel = true
    }
  }, [activeMessage, messagesAcked, allToggles]) // Execute when another message has been acked or a new element used in some message renders

  useEffect(() => {
    if (activeMessage !== null && activeMessage !== undefined) {
      showCallback({
        messageId: activeMessage.id,
        children: activeMessage.children,
        onAck: () => ackMessage(activeMessage.id)
      })
      activeMessage.toggles?.map((toggle) => {
        toggle(true)
      })
    }
  }, [activeMessage])

  return {
    activeMessageId: activeMessage?.id,
    addToggle: (elementId: string, toggle: Toggle) => {
      setAllToggles((toggles) => ({
        ...toggles,
        [elementId]: toggle
      }))
    },
    ackMessage,
    HighlightElement
  }
}

export const OnboardProvider: FC<{
  messages: Array<Message>
  showCallback: ShowCallback
  ackCallback: AckCallback
  HighlightElement: any
}> = ({ children, messages, showCallback, ackCallback, HighlightElement }) => {
  const value = useOnboardProvider(
    messages,
    showCallback,
    ackCallback,
    HighlightElement
  )
  return (
    <OnboardContextProvider value={value}>{children}</OnboardContextProvider>
  )
}

export { useOnboard }
