import React, { useState, useEffect, cloneElement, FC } from 'react'
import { useOnboard } from './OnboardProvider'

interface Props {
  id: string
}

/**
 * Wrapper for element to be highlighted with badge during an onboard message
 */
export const OnboardElement: FC<Props> = ({ id, children }) => {
  const [isActive, setIsActive] = useState(false)
  const {
    addToggle,
    activeMessageId,
    ackMessage,
    HighlightElement
  } = useOnboard()

  useEffect(() => {
    addToggle(id, setIsActive)

    // TODO: Remove when unmounted
  }, [])

  const dismiss = () => {
    if (isActive) {
      ackMessage(activeMessageId!)
    }
  }

  const [dismissTimeout, setDismissTimeout] = useState<number>()

  const newChildren = cloneElement(children as any, {
    style: { visibility: 'visible', ...(children as any).props.style },
    ...(children as any).props
  })

  return (
    <HighlightElement
      onClick={() => {
        dismiss()
        window.clearTimeout(dismissTimeout)
        setDismissTimeout(undefined)
      }}
      onMouseOver={() => {
        if (dismissTimeout === undefined)
          setDismissTimeout(window.setTimeout(dismiss, 1000))
      }}
      onMouseLeave={() => {
        window.clearTimeout(dismissTimeout)
        setDismissTimeout(undefined)
      }}
      style={{ visibility: isActive ? 'initial' : 'hidden' }}
    >
      {newChildren}
    </HighlightElement>
  )
}
