import { Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import SetPage from './pages/SetPage'
import CardDetailPage from './pages/CardDetailPage'
import RulesPage from './pages/RulesPage'
import CollectionsPage from './pages/CollectionPage'
import LibraryPage from './pages/LibraryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/sets" element={<CollectionsPage />} />
      <Route path="/set/:setId" element={<SetPage />} />
      <Route path="/card/:cardId" element={<CardDetailPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/library" element={<LibraryPage />} />
    </Routes>
  )
}

export default App