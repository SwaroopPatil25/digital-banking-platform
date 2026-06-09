import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router.tsx'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store.ts'
import ErrorBoundary from './shared/components/ErrorBoundary.tsx'

// Suppress console in production to prevent info leakage
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <RouterProvider router={router} />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
