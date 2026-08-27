import {
  BookOpen,
  Brain,
  LogOut,
  Trophy,
  Upload,
  Users
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const isTeacher = user.role === "TEACHER";

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon small">
            <Brain size={20} />
          </div>

          <span>QuizMind</span>
        </div>

        <nav>
          <a className="nav-item active">
            <Brain size={18} />
            Dashboard
          </a>

          {isTeacher ? (
            <>
              <a className="nav-item">
                <Upload size={18} />
                Materials
              </a>

              <a className="nav-item">
                <BookOpen size={18} />
                Quizzes
              </a>

              <a className="nav-item">
                <Users size={18} />
                Students
              </a>
            </>
          ) : (
            <>
              <a className="nav-item">
                <BookOpen size={18} />
                My Quizzes
              </a>

              <a className="nav-item">
                <Trophy size={18} />
                Leaderboard
              </a>
            </>
          )}
        </nav>

        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">
              {isTeacher ? "Teacher workspace" : "Student workspace"}
            </p>

            <h1>
              Hello, {user.name.split(" ")[0]} 👋
            </h1>

            <p>
              {isTeacher
                ? "Create smarter assessments with AI."
                : "Keep learning and improve every day."}
            </p>
          </div>

          <div className="profile">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </header>

        {isTeacher ? (
          <section className="dashboard-content">
            <div className="welcome-card">
              <div>
                <span className="card-label">
                  AI QUIZ GENERATOR
                </span>

                <h2>
                  Turn your study material
                  into engaging quizzes.
                </h2>

                <p>
                  Upload notes or documents and let
                  AI create questions, flashcards
                  and explanations.
                </p>

                <button className="primary-button compact">
                  <Upload size={18} />
                  Upload material
                </button>
              </div>

              <div className="hero-icon">
                <Brain size={72} />
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <span>Total materials</span>
                <strong>0</strong>
              </div>

              <div className="stat-card">
                <span>Generated quizzes</span>
                <strong>0</strong>
              </div>

              <div className="stat-card">
                <span>Active students</span>
                <strong>0</strong>
              </div>
            </div>
          </section>
        ) : (
          <section className="dashboard-content">
            <div className="welcome-card student">
              <div>
                <span className="card-label">
                  YOUR LEARNING SPACE
                </span>

                <h2>
                  Learn. Practice. Improve.
                </h2>

                <p>
                  Take assigned quizzes, review
                  explanations and discover your
                  strongest and weakest topics.
                </p>

                <button className="primary-button compact">
                  <BookOpen size={18} />
                  View quizzes
                </button>
              </div>

              <div className="hero-icon">
                <BookOpen size={72} />
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <span>Quizzes completed</span>
                <strong>0</strong>
              </div>

              <div className="stat-card">
                <span>Average score</span>
                <strong>—</strong>
              </div>

              <div className="stat-card">
                <span>Current streak</span>
                <strong>0 🔥</strong>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
