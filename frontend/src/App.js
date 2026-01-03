import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './layout/MainLayout.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import MainLayout from './layout/MainLayout';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import CoursesCatalogPage from './pages/courses/CoursesCatalogPage';
import CourseDetailsPage from './pages/courses/CourseDetailsPage';
import MyLearningPage from './pages/learning/MyLearningPage';
import CoursePlayerPage from './pages/learning/CoursePlayerPage';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import InstructorCourseEditorPage from './pages/instructor/InstructorCourseEditorPage';
import CheckoutPage from './pages/payments/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CoursesCatalogPage />} />
          <Route path="courses" element={<CoursesCatalogPage />} />
          <Route path="courses/:courseId" element={<CourseDetailsPage />} />

          <Route path="learning" element={<MyLearningPage />} />
          <Route path="learning/:courseId" element={<CoursePlayerPage />} />

          <Route path="instructor/courses" element={<InstructorCoursesPage />} />
          <Route
            path="instructor/courses/:courseId"
            element={<InstructorCourseEditorPage />}
          />

          <Route path="checkout/:courseId" element={<CheckoutPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
