import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Analytics from './pages/Analytics.jsx' // Make sure this path is correct
import AiDetect from './pages/Aidetect.jsx'
import FaultLog from './pages/FaultLog.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The Dashboard acts as the home route */}
        <Route path="/" element={<App />} />
        {/* The new Analytics page */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-detect" element={<AiDetect />} />
        <Route path="/fault-log" element={<FaultLog />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)