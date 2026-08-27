import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './utils/protectedRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import NotFound from './pages/NotFound';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherUpload from './pages/teacher/TeacherUpload';
import QuizReview from './pages/teacher/QuizReview';
import MyQuizzes from './pages/teacher/MyQuizzes';
import QuizDetail from './pages/teacher/QuizDetail';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentQuizzes from './pages/student/StudentQuizzes';
import StudentAttempts from './pages/student/StudentAttempts';
import StudentQuiz from './pages/student/StudentQuiz';
import StudentResult from './pages/student/StudentResult';

/* ── Dashboard smart redirect ── */
function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

/* ── Layout wrapper for authenticated routes ── */
function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>

            {/* ── Public Routes ── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404"      element={<NotFound />} />

            {/* ── Dashboard Redirect ── */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />

            {/* ── Shared Authenticated Routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/settings"    element={<Settings />} />
              </Route>
            </Route>

            {/* ── Teacher Routes ── */}
            <Route element={<ProtectedRoute role="TEACHER" />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/teacher/dashboard"        element={<TeacherDashboard />} />
                <Route path="/teacher/upload"           element={<TeacherUpload />} />
                <Route path="/teacher/create"           element={<Navigate to="/teacher/upload" replace />} />
                <Route path="/teacher/quizzes/review"   element={<QuizReview />} />
                <Route path="/teacher/quizzes"          element={<MyQuizzes />} />
                <Route path="/teacher/quizzes/:id"      element={<QuizDetail />} />
                <Route path="/teacher/analytics"        element={<TeacherAnalytics />} />
                <Route path="/teacher/leaderboard"      element={<Leaderboard />} />
                <Route path="/teacher/settings"         element={<Settings />} />
              </Route>
            </Route>

            {/* ── Student Routes ── */}
            <Route element={<ProtectedRoute role="STUDENT" />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/student/dashboard"          element={<StudentDashboard />} />
                <Route path="/student/quizzes"            element={<StudentQuizzes />} />
                <Route path="/student/attempts"           element={<StudentAttempts />} />
                <Route path="/student/leaderboard"        element={<Leaderboard />} />
                <Route path="/student/quiz/:id"           element={<StudentQuiz />} />
                <Route path="/quiz/:id"                   element={<StudentQuiz />} />
                <Route path="/student/result/:attemptId"  element={<StudentResult />} />
                <Route path="/student/results/:attemptId" element={<StudentResult />} />
                <Route path="/student/settings"           element={<Settings />} />
              </Route>
            </Route>

            {/* ── Root & catch-all ── */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<NotFound />} />

          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
