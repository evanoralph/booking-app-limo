import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BookingProvider } from '@/context/BookingContext'
import { GoogleMapsProvider } from '@/components/maps/GoogleMapsProvider'
import { BookingPage } from '@/pages/BookingPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'
import { SuccessPage } from '@/pages/SuccessPage'

function App() {
  return (
    <GoogleMapsProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </GoogleMapsProvider>
  )
}

export default App
