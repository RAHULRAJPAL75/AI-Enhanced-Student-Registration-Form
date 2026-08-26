import { useState } from "react";

function Login({ onSuccess }) {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (event) => {
    setLogin({
      ...login,
      [event.target.name]: event.target.value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please check credentials.");
      }

      setSuccessMsg(data.message || "Authenticated successfully!");
      setLogin({
        email: "",
        password: "",
      });

      setTimeout(() => {
        onSuccess?.(data.student);
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || "Could not connect to Node.js backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h3>Student login</h3>
        <p>Return to your agile project workspace with MongoDB authentication.</p>
      </div>

      {errorMsg && (
        <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "12px" }}>
          ❌ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "10px 14px", backgroundColor: "#dcfce7", border: "1px solid #4ade80", color: "#166534", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "12px" }}>
          ✅ {successMsg}
        </div>
      )}

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

      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? "Authenticating..." : "Open dashboard"}
      </button>
    </form>
  );
}

export default Login;
