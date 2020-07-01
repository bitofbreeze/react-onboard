# react-onboard

> Create onboarding messages and highlight related components

[![NPM](https://img.shields.io/npm/v/react-onboard.svg)](https://www.npmjs.com/package/react-onboard) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**react-onboard** lets you easily present a set of messages that are associated with components in your app to the user. Messages go away after a user has acknowledged them (i.e., clicked a highlight or hovered over it for more than a second). It interoperates with any way you show notifications (e.g., react-toastify) and with any wrapper component to highlight components.

## Install

```bash
npm install --save react-onboard
```

or

```bash
yarn add react-onboard
```

## Usage

Below is a full-fledged case using [react-toastify](https://github.com/fkhadra/react-toastify) for notifications and [material-ui](https://github.com/mui-org/material-ui) for component highlights. See this same example interactively on [CodeSandbox](https://codesandbox.io/s/vigilant-hill-2913t?file=/src/App.tsx).

```tsx
import React from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Badge, BadgeProps } from '@material-ui/core'
import InfoTwoToneIcon from '@material-ui/icons/InfoTwoTone'
import { OnboardProvider, OnboardElement } from 'react-onboard'

export default function App() {
  const messages = [
    {
      id: 'welcomeMessage',
      children: <div>Welcome to react-onboard</div>,
      elementIds: ['welcome']
    },
    {
      id: 'byeMessage',
      children: <div>Bye-bye</div>,
      elementIds: ['bye']
    }
  ]

  return (
    <>
      <ToastContainer />
      <OnboardProvider
        messages={messages}
        showCallback={({ messageId, children, onAck }) => {
          toast.info(children, {
            autoClose: false,
            toastId: messageId,
            onClose: onAck
          })
        }}
        ackCallback={({ messageId }) => toast.dismiss(messageId)}
        HighlightElement={
          (({ children, ...rest }) => (
            <Badge
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              badgeContent={<InfoTwoToneIcon color='primary' />}
              {...rest}
            >
              {children}
            </Badge>
          )) as React.FC<BadgeProps>
        }
      >
        <OnboardElement id='welcome'>
          <div>WELCOME</div>
        </OnboardElement>
        <br />
        <OnboardElement id='bye'>
          <div>BYE</div>
        </OnboardElement>
      </OnboardProvider>
    </>
  )
}
```

## License

MIT © [CSFlorin](https://github.com/CSFlorin)
