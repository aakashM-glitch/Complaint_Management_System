import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import EngineerDashboard from './components/EngineerDashboard'
import MyComplaints from './components/MyComplaints'
import ComplaintDetails from './components/ComplaintDetails'
import Profile from './components/Profile'
import Notifications from './components/Notifications'
import Feedback from './components/Feedback'
import Reports from './components/Reports'
import SmsTest from './components/SmsTest'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" />
  }

  return children
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Login />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />} />

      {/* USER Routes */}
      <Route
        path="/user"
        element={
          <PrivateRoute allowedRoles={['USER']}>
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/user/my-complaints"
        element={
          <PrivateRoute allowedRoles={['USER']}>
            <MyComplaints />
          </PrivateRoute>
        }
      />

      {/* ADMIN Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <Reports />
          </PrivateRoute>
        }
      />

      {/* ENGINEER Routes */}
      <Route
        path="/engineer"
        element={
          <PrivateRoute allowedRoles={['ENGINEER']}>
            <EngineerDashboard />
          </PrivateRoute>
        }
      />

      {/* Shared Routes (All roles) */}
      <Route
        path="/complaint/:id"
        element={
          <PrivateRoute allowedRoles={['USER', 'ADMIN', 'ENGINEER']}>
            <ComplaintDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute allowedRoles={['USER', 'ADMIN', 'ENGINEER']}>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute allowedRoles={['USER', 'ADMIN', 'ENGINEER']}>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute allowedRoles={['USER', 'ADMIN', 'ENGINEER']}>
            <Feedback />
          </PrivateRoute>
        }
      />
      <Route
        path="/sms-test"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'ENGINEER', 'USER']}>
            <SmsTest />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to={isAuthenticated ? `/${user.role.toLowerCase()}` : '/login'} />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
