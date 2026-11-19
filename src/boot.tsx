import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

export function boot() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
