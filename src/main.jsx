import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './Store'
import './index.css'
import App from './App.jsx'

import { SignalRProvider } from './context/SignalRContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <SignalRProvider>
        <App />
      </SignalRProvider>
    </Provider>
  </StrictMode>,
)

