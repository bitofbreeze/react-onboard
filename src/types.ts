import { ReactNode } from 'react';

export interface Item {
  // Unique name
  readonly id: string;
}

export interface Message extends Item {
  // Array of names of onboard elements to highlight when message is shown
  readonly elementIds?: Array<string>;
  readonly children: ReactNode;
  readonly delay?: number;
}

export interface OnboardContext {
  activeMessage: Message | null;
  // Allows us to keep track of elements wrapped with OnboardElement
  // elementId allows element to be used in messages (it is the linking mechanism)
  onElementRender: (elementId: string) => void;
  onElementUnrender: (elementId: string) => void;
  ackMessage: (id: string) => void;
  HighlightComponent: any;
}

export type ShowCallback = ({
  messageId,
  children,
  onAck,
}: {
  messageId: string;
  children: ReactNode;
  onAck: () => void;
}) => void;

export type AckCallback = ({ messageId }: { messageId: string }) => void;

export interface OnboardElementProps extends Item {
  ackOnClick?: boolean;
  ackOnMouseOver?: number;
}
