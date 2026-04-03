import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserProvider } from "./components/contexts/UserContext.jsx";
import { ToastProvider } from './predefined_components/Toast';
import App from './App.jsx'
import { ClerkProvider } from '@clerk/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <ToastProvider>
        <ClerkProvider
          afterSignOutUrl="/"
        >
          <App />
        </ClerkProvider>
      </ToastProvider>
    </UserProvider>
  </StrictMode>,
)
