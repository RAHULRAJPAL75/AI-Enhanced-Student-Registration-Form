import { useState } from "react";

function Registration({ onSuccess }) {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (event) => {
    setStudent({
      ...student,
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
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setSuccessMsg(data.message || "Successfully registered in MongoDB!");
      
      setStudent({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        onSuccess?.(data.student);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Could not connect to Node.js backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h3>Create student profile</h3>
        <p>Start your sprint workspace with a secure account stored in MongoDB.</p>
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
        Full name
        <input
          name="name"
          onChange={handleChange}
          placeholder="Rahul Sharma"
          required
          type="text"
          value={student.name}
        />
      </label>

      <label>
        Email address
        <input
          name="email"
          onChange={handleChange}
          placeholder="student@example.com"
          required
          type="email"
          value={student.email}
        />
      </label>

      <label>
        Password
        <input
          minLength="6"
          name="password"
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          required
          type="password"
          value={student.password}
        />
      </label>

      <label>
        Account type
        <select
          name="role"
          onChange={handleChange}
          value={student.role}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? "Connecting to Database..." : "Create sprint profile"}
      </button>
    </form>
  );
}

export default Registration;
