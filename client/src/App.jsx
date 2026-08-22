import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Learn from './pages/Learn';
import CourseDetails from './pages/CourseDetails';
import LessonViewer from './pages/LessonViewer';
import Sandbox from './pages/Sandbox';
import Goals from './pages/Goals';

import Planning from './pages/Planning';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import AppErrorBoundary from './components/AppErrorBoundary';

function App() {
  return (
    <AppErrorBoundary><Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes wrapped in navigation Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <Layout>
                  <Learn />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/course/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CourseDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/lesson/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <LessonViewer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sandbox"
            element={
              <ProtectedRoute>
                <Layout>
                  <Sandbox />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <Layout>
                  <Planning />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Layout>
                  <Goals />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Layout>
                  <Assessment />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/assistant" element={<ProtectedRoute><Layout><Assistant /></Layout></ProtectedRoute>} />

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router></AppErrorBoundary>
  );
}

export default App;
