import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Registration from "../Registration";
import Login from "../Login";
import Dashboard from "./pages/Dashboard";
import "./styles/app.css";

function App() {
  const [activeForm, setActiveForm] = useState("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (event, targetId, formType) => {
    event.preventDefault();
    if (formType) {
      setActiveForm(formType);
    }
    scrollToSection(targetId);
  };

  const handleLogout = (event) => {
    event.preventDefault();
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <div style={styles.page}>
        <Navbar onNavigate={handleNavClick} onLogout={handleLogout} isLoggedIn={true} />
        <Dashboard />
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar onNavigate={handleNavClick} onLogout={handleLogout} isLoggedIn={false} />

      <header id="home" style={styles.header}>
        <div style={styles.headerContent}>
          <p style={styles.eyebrow}>Simple student access</p>
          <h1>Welcome to your new student account.</h1>
          <p style={styles.subtitle}>
            Register quickly, sign in securely, and begin your learning journey.
          </p>
          <div style={styles.actions}>
            <button onClick={() => setActiveForm("register")} style={styles.primaryBtn}>
              Register Now
            </button>
            <button onClick={() => setActiveForm("login")} style={styles.secondaryBtn}>
              Login
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.infoCard}>
          <h2>Why join?</h2>
          <ul style={styles.list}>
            <li>Easy student registration</li>
            <li>Fast and safe login</li>
            <li>Simple landing experience</li>
          </ul>
        </section>

        <section id="auth-form" style={styles.formCard}>
          <div style={styles.toggle}>
            <button
              onClick={() => setActiveForm("register")}
              style={activeForm === "register" ? styles.activeTab : styles.tab}
            >
              Register
            </button>
            <button
              onClick={() => setActiveForm("login")}
              style={activeForm === "login" ? styles.activeTab : styles.tab}
            >
              Login
            </button>
          </div>

          {activeForm === "register" ? (
            <Registration onSuccess={handleAuthSuccess} />
          ) : (
            <Login onSuccess={handleAuthSuccess} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    color: "#1f2937",
  },
  header: {
    padding: "60px 40px 40px",
    textAlign: "center",
  },
  headerContent: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  eyebrow: {
    color: "#4f46e5",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#475569",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
  },
  primaryBtn: {
    border: "none",
    padding: "10px 18px",
    background: "#4f46e5",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryBtn: {
    border: "1px solid #4f46e5",
    padding: "10px 18px",
    background: "white",
    color: "#4f46e5",
    borderRadius: "8px",
    cursor: "pointer",
  },
  main: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    padding: "20px 40px 60px",
    flexWrap: "wrap",
  },
  infoCard: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
    width: "280px",
  },
  list: {
    paddingLeft: "18px",
    lineHeight: "1.7",
  },
  formCard: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
    width: "320px",
  },
  toggle: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  tab: {
    border: "1px solid #cbd5e1",
    padding: "8px 12px",
    background: "#f8fafc",
    borderRadius: "6px",
    cursor: "pointer",
  },
  activeTab: {
    border: "none",
    padding: "8px 12px",
    background: "#4f46e5",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default App;
