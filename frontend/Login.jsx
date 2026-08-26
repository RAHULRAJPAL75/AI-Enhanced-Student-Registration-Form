import { useState } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function Login({ onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "reset"
  const [login, setLogin] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [reset, setReset] = useState({ email: "", code: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (mode === "login") {
      setLogin((prev) => ({ ...prev, [name]: value }));
    } else if (mode === "forgot") {
      setForgotEmail(value);
    } else {
      setReset((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMsg) setErrorMsg("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please check credentials.");
      }

      const student = data.student;
      const roleLabel = student?.role === "admin" ? "Admin" : student?.role === "instructor" ? "Instructor" : "Student";
      const studentId = student?.id || student?._id || "N/A";

      setSuccessMsg(
        `${roleLabel} authenticated! ID: ${studentId}`
      );
      setLogin({ email: "", password: "" });

      setTimeout(() => {
        onSuccess?.(student);
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || "Could not connect to Node.js backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send the verification email.");
      }

      setReset({ email: forgotEmail.trim(), code: "", password: "" });
      setSuccessMsg(data.message || "A verification code has been sent to your Gmail address.");
      setMode("reset");
    } catch (err) {
      setErrorMsg(err.message || "Could not connect to Node.js backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset failed.");
      }

      setSuccessMsg(data.message || "Password reset successful!");
      setReset({ email: "", code: "", password: "" });
      setTimeout(() => {
        setMode("login");
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Could not connect to Node.js backend.");
    } finally {
      setLoading(false);
    }
  };

  const MessageBanner = () =>
    errorMsg ? (
      <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "12px" }}>
        ❌ {errorMsg}
      </div>
    ) : successMsg ? (
      <div style={{ padding: "10px 14px", backgroundColor: "#dcfce7", border: "1px solid #4ade80", color: "#166534", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "12px" }}>
        ✅ {successMsg}
      </div>
    ) : null;

  if (mode === "login") {
    return (
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-heading">
          <h3>Student login</h3>
          <p>Return to your agile project workspace with MongoDB authentication.</p>
        </div>

        <MessageBanner />

        <label>
          Email address
          <input
            name="email"
            onChange={handleChange}
            placeholder="student@example.com"
            required
            type="email"
            value={login.email}
          />
        </label>

        <label>
          Password
          <input
            minLength="6"
            name="password"
            onChange={handleChange}
            placeholder="Your password"
            required
            type="password"
            value={login.password}
          />
        </label>

        <div style={{ textAlign: "right", marginTop: "-4px", marginBottom: "6px" }}>
          <button
            type="button"
            onClick={() => {
              clearMessages();
              setMode("forgot");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
              padding: "0",
            }}
          >
            Forgot password?
          </button>
        </div>

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Open dashboard"}
        </button>
      </form>
    );
  }

  if (mode === "forgot") {
    return (
      <form className="auth-form" onSubmit={handleForgot}>
        <div className="form-heading">
          <h3>Forgot password</h3>
          <p>Enter your account email and we will send a verification code to Gmail.</p>
        </div>

        <MessageBanner />

        <label>
          Email address
          <input
            name="email"
            onChange={handleChange}
            placeholder="student@example.com"
            required
            type="email"
            value={forgotEmail}
          />
        </label>

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Sending email..." : "Send verification email"}
        </button>

        <button
          type="button"
          className="submit-button"
          style={{ background: "#e2e8f0", color: "#1e293b", marginTop: "10px" }}
          onClick={() => {
            clearMessages();
            setMode("login");
          }}
          disabled={loading}
        >
          Back to login
        </button>
      </form>
    );
  }

  // mode === "reset"
  return (
    <form className="auth-form" onSubmit={handleReset}>
      <div className="form-heading">
        <h3>Reset password</h3>
        <p>Check your Gmail inbox, enter the verification code, and choose a new password.</p>
      </div>

      <MessageBanner />

      <label>
        Email address
        <input
          name="email"
          onChange={handleChange}
          placeholder="student@example.com"
          required
          type="email"
          value={reset.email}
        />
      </label>

      <label>
        Reset code
        <div style={{ position: "relative" }}>
          <input
            name="code"
            onChange={handleChange}
            placeholder="6-digit code"
            required
            inputMode="numeric"
            value={reset.code}
          />
        </div>
      </label>

      <label>
        New password
        <input
          minLength="6"
          name="password"
          onChange={handleChange}
          placeholder="At least 6 characters"
          required
          type="password"
          value={reset.password}
        />
      </label>

      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? "Resetting..." : "Reset password"}
      </button>

      <button
        type="button"
        className="submit-button"
        style={{ background: "#e2e8f0", color: "#1e293b", marginTop: "10px" }}
        onClick={() => {
          clearMessages();
          setMode("login");
        }}
        disabled={loading}
      >
        Back to login
      </button>
    </form>
  );
}

export default Login;
