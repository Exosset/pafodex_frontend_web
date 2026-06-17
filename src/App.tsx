import { Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import CollectionsPage from './pages/CollectionPage'
import LibraryPage from './pages/LibraryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/library" element={<LibraryPage />} />
    </Routes>
  )
}

export default App