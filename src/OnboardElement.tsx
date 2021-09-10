import React, {
  useState, useEffect, cloneElement, FC, ReactElement,
} from 'react';
import { useOnboard } from './OnboardProvider';
import { OnboardElementProps } from './types';

/**
 * Wrapper for element to be highlighted with badge during an onboard message
 */
export const OnboardElement: FC<OnboardElementProps> = ({
  id,
  children,
  ackOnClick = true,
  ackOnMouseOver = 1000,
}) => {
  const [isActive, setIsActive] = useState(false);
  const {
    onElementRender,
    onElementUnrender,
    activeMessage,
    ackMessage,
    HighlightComponent,
  } = useOnboard();

  // Alert provider when this element is rendered
  useEffect(() => {
    onElementRender(id);

    return () => onElementUnrender(id);
  }, []);

  // Make the highlight component visible when a message that uses this element is active
  useEffect(() => {
    setIsActive(Boolean(activeMessage?.elementIds?.includes(id)));

    return () => setIsActive(false);
  }, [activeMessage]);

  // Allow dismissing the related message by interacting with this element
  const dismiss = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (isActive) ackMessage(activeMessage!.id);
  };

  const [dismissTimeout, setDismissTimeout] = useState<number>();

  const newChildren = cloneElement(children as ReactElement, {
    ...(children as ReactElement).props,
    style: { visibility: 'initial', ...(children as ReactElement).props.style },
  });

  return (
    <HighlightComponent
      onClick={() => {
        if (ackOnClick) {
          dismiss();
          window.clearTimeout(dismissTimeout);
          setDismissTimeout(undefined);
        }
      }}
      onMouseOver={() => {
        if (ackOnMouseOver > 0 && dismissTimeout === undefined) { setDismissTimeout(window.setTimeout(dismiss, ackOnMouseOver)); }
      }}
      onMouseLeave={() => {
        if (ackOnMouseOver > 0) {
          window.clearTimeout(dismissTimeout);
          setDismissTimeout(undefined);
        }
      }}
      style={{ visibility: isActive ? 'initial' : 'hidden' }}
    >
      {newChildren}
    </HighlightComponent>
  );
};
