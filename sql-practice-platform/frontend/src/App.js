import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import NewHomePage from './pages/NewHomePage';
import TestHomePage from './pages/TestHomePage';
import PracticePage from './pages/PracticePage';
import ProblemsPage from './pages/ProblemsPage';
import ProgressPage from './pages/ProgressPage';
import LearningPathsPage from './pages/LearningPathsPage';
import BookmarksPage from './pages/BookmarksPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LearnPage from './pages/LearnPage';
import LearnModulePage from './pages/LearnModulePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen transition-colors bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<NewHomePage />} />
              <Route path="/new-home" element={<NewHomePage />} />
              <Route path="/test" element={<TestHomePage />} />
              <Route path="/old-home" element={<HomePage />} />
              <Route path="/practice/:problemId" element={<PracticePage />} />
              <Route path="/practice" element={<Navigate to="/problems" replace />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/learning-paths" element={<LearningPathsPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/learn/modules/:moduleId" element={<LearnModulePage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;