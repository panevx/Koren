import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AgeSelect } from './screens/AgeSelect'
import { Home } from './screens/Home'
import { Welcome } from './screens/Welcome'

// BASE_URL is "/Koren/" on GitHub Pages and "/" locally; the router needs it without the trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/age" element={<AgeSelect />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
