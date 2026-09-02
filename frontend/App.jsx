import { useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Registration from "./Registration";
import Login from "./Login";
import ProfilePage from "./src/pages/Profile";
import DashboardView from "./src/pages/DashboardView";
import StudentsView from "./src/pages/StudentsView";
import ActivityView from "./src/pages/ActivityView";
import Sidebar from "./src/components/Sidebar";
import DashboardTopbar from "./src/components/DashboardTopbar";
import AIChatWidget from "./src/components/AIChatWidget";
import StudentModal from "./src/components/StudentModal";
import StudentProfileModal from "./src/components/StudentProfileModal";
import DeleteConfirmModal from "./src/components/DeleteConfirmModal";
import LogoutConfirmModal from "./src/components/LogoutConfirmModal";
import { formatStudentDate, parseStudentDate, getInitials, getProfileImageUrl, escapeCsv, getStudentId } from "./src/utils/dashboardUtils";
import "./src/styles/app.css";

const heroPhoto =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=85";

const photoStories = [
  {
    title: "Sprint planning",
    text: "Shape student projects into focused two-week delivery goals.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pair programming",
    text: "Practice real collaboration with reviews, demos, and shared code.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Product demos",
    text: "Present working increments and learn from fast feedback loops.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
];

const sprintSteps = ["Discover", "Plan", "Build", "Review"];

const stats = [
  { value: "4", label: "sprint rituals" },
  { value: "12+", label: "project checkpoints" },
  { value: "1", label: "student workspace" },
];

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
const emptyStudentForm = { name: "", email: "", password: "" };

const getExportRows = (students) => students.map((student, index) => ({
  "#": index + 1,
  Student: student.name || "",
  Email: student.email || "",
  "MongoDB ID": getStudentId(student) || "",
  Role: student.role || "student",
  "Registered On": formatStudentDate(student.createdAt, "short"),
  Status: "Active",
}));

function exportStudentsFile(students, format, notify) {
  if (students.length === 0) {
    notify.info("No student records available to export.");
    return;
  }

  const rows = getExportRows(students);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `rahul-lab-students-${date}`;

  if (format === "excel") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Records");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } else if (format === "pdf") {
    const document = new jsPDF({ orientation: "landscape" });
    autoTable(document, {
      head: [Object.keys(rows[0])],
      body: rows.map((row) => Object.values(row)),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 118, 110] },
      margin: { top: 18, left: 12, right: 12 },
    });
    document.save(`${filename}.pdf`);
  } else {
    const csv = [Object.keys(rows[0]), ...rows.map((row) => Object.values(row))]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  notify.success(`Student records exported as ${format === "excel" ? "Microsoft Excel" : format.toUpperCase()}.`);
}

function App() {
  const [activeForm, setActiveForm] = useState("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSubmitting, setStudentSubmitting] = useState(false);
  const [studentDeletingId, setStudentDeletingId] = useState("");
  
  // Modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [editingStudent, setEditingStudent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students`);
      const data = await res.json();
      if (data.success) {
        setStudentsList(data.students || []);
      }
    } catch (err) {
      console.log("Could not fetch students list:", err.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === "admin") {
      fetchStudents();
    } else if (!isLoggedIn || currentUser?.role !== "admin") {
      setStudentsList([]);
    }
  }, [isLoggedIn, currentUser?.role]);

  const handleAuthSuccess = (studentData) => {
    setCurrentUser(studentData);
    setIsLoggedIn(true);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const showAuth = (formType) => {
    setActiveForm(formType);
    window.requestAnimationFrame(() => scrollToSection("auth-form"));
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
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsLoggedIn(false);
    setCurrentUser(null);
    resetStudentEditor();
    setStudentSearch("");
    setActiveView("dashboard");
    window.requestAnimationFrame(() => scrollToSection("home"));
  };

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) {
      return studentsList;
    }

    return studentsList.filter((student) => {
      const name = student.name?.toLowerCase() || "";
      const email = student.email?.toLowerCase() || "";
      const registeredOn = student.createdAt
        ? new Date(student.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).toLowerCase()
        : "recently";

      return name.includes(query) || email.includes(query) || registeredOn.includes(query);
    });
  }, [studentSearch, studentsList]);

  const resetStudentEditor = () => {
    setIsStudentModalOpen(false);
    setEditingStudent(null);
    setModalMode("create");
  };

  const openCreateStudent = () => {
    setModalMode("create");
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const openEditStudent = (student) => {
    setModalMode("edit");
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleStudentFormChange = (event) => {
    // No longer needed - handled in modal
  };

  const handleStudentSave = async (formData) => {
    const isEditingStudent = modalMode === "edit" && editingStudent;
    const editingStudentId = editingStudent ? getStudentId(editingStudent) : null;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(
        `${API_BASE_URL}/students${isEditingStudent ? `/${editingStudentId}` : ""}`,
        {
          method: isEditingStudent ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Student record could not be saved.");
      }

      const savedStudent = data.student;
      const savedStudentId = getStudentId(savedStudent);

      setStudentsList((currentStudents) => {
        if (isEditingStudent) {
          return currentStudents.map((student) =>
            getStudentId(student) === editingStudentId ? savedStudent : student
          );
        }

        return [savedStudent, ...currentStudents];
      });

      if (isEditingStudent && getStudentId(currentUser) === editingStudentId) {
        setCurrentUser((user) => ({
          ...user,
          ...savedStudent,
          id: savedStudentId,
        }));
      }

      resetStudentEditor();
      
      // Success toast
      toast.success(
        isEditingStudent 
          ? `${formData.name}'s record updated successfully.`
          : `${formData.name} added to the system.`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
      
      // Auto-refresh the list
      fetchStudents();
    } catch (err) {
      toast.error(err.message || "Could not connect to the backend.", {
        position: "top-right",
        autoClose: 5000,
      });
      throw err; // Re-throw so modal can handle loading state
    }
  };

  const handleProfileImageUpload = async (imageFile) => {
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const userId = getStudentId(currentUser);
    const imageFormData = new FormData();
    imageFormData.append("image", imageFile);
    imageFormData.append("_id", userId);

    const imageResponse = await fetch(`${API_BASE_URL}/profile/image`, {
      method: "POST",
      body: imageFormData,
    });
    const imageData = await imageResponse.json();

    if (!imageResponse.ok || !imageData.success) {
      throw new Error(imageData.message || "Profile image upload failed.");
    }

    const updatedUser = {
      ...currentUser,
      ...(imageData.student || {}),
      profileImage: imageData.imageUrl,
    };

    setCurrentUser(updatedUser);
    setStudentsList((currentStudents) =>
      currentStudents.map((student) =>
        getStudentId(student) === userId ? { ...student, ...updatedUser } : student
      )
    );
    toast.success("Profile photo uploaded successfully.", {
      position: "top-right",
      autoClose: 3000,
    });

    return imageData.imageUrl;
  };

  const handleProfileSave = async (profileData) => {
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const userId = getStudentId(currentUser);
    const response = await fetch(`${API_BASE_URL}/students/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Profile update failed.");
    }

    setCurrentUser(data.student);
    setStudentsList((currentStudents) =>
      currentStudents.map((student) =>
        getStudentId(student) === userId ? data.student : student
      )
    );

    toast.success("Your profile was updated successfully.", {
      position: "top-right",
      autoClose: 4000,
    });

    return data.student;
  };

  const openDeleteConfirm = (student) => {
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    
    const student = deletingStudent;
    const studentId = getStudentId(student);
    
    setStudentDeletingId(studentId);

    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Student record could not be deleted.");
      }

      setStudentsList((currentStudents) =>
        currentStudents.filter((item) => getStudentId(item) !== studentId)
      );

      setIsDeleteModalOpen(false);
      setDeletingStudent(null);

      toast.success(`${student.name} deleted successfully.`, {
        position: "top-right",
        autoClose: 3000,
      });

      if (getStudentId(currentUser) === studentId) {
        window.setTimeout(() => {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setStudentSearch("");
          scrollToSection("home");
          toast.info("Your account was deleted. Redirecting to home...", {
            position: "top-right",
          });
        }, 1000);
      }
    } catch (err) {
      toast.error(err.message || "Could not connect to the backend.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setStudentDeletingId("");
    }
  };

  if (isLoggedIn) {
    if (currentUser?.role === "student" || !currentUser?.role) {
      return (
        <StudentExperience
          currentUser={currentUser}
          onLogout={handleLogout}
          onLogoutConfirm={confirmLogout}
          isLogoutModalOpen={isLogoutModalOpen}
          closeLogoutModal={() => setIsLogoutModalOpen(false)}
          handleProfileSave={handleProfileSave}
          handleProfileImageUpload={handleProfileImageUpload}
          studentsList={studentsList}
          studentsLoading={studentsLoading}
          fetchStudents={fetchStudents}
          filteredStudents={filteredStudents}
          studentSearch={studentSearch}
          setStudentSearch={setStudentSearch}
          exportStudents={(format = "csv") => exportStudentsFile(filteredStudents, format, toast)}
          openCreateStudent={openCreateStudent}
          openEditStudent={openEditStudent}
          openViewProfile={setViewingStudent}
          openDeleteConfirm={openDeleteConfirm}
          studentDeletingId={studentDeletingId}
          isStudentModalOpen={isStudentModalOpen}
          resetStudentEditor={resetStudentEditor}
          handleStudentSave={handleStudentSave}
          modalMode={modalMode}
          editingStudent={editingStudent}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          handleDeleteConfirm={handleDeleteConfirm}
          deletingStudent={deletingStudent}
        />
      );
    }

    return (
      <DashboardExperience
        activeView={activeView}
        currentUser={currentUser}
        deletingStudent={deletingStudent}
        editingStudent={editingStudent}
        fetchStudents={fetchStudents}
        filteredStudents={filteredStudents}
        handleDeleteConfirm={handleDeleteConfirm}
        handleExportToast={toast}
        handleLogout={handleLogout}
        onLogoutConfirm={confirmLogout}
        isLogoutModalOpen={isLogoutModalOpen}
        closeLogoutModal={() => setIsLogoutModalOpen(false)}
        handleProfileSave={handleProfileSave}
        handleProfileImageUpload={handleProfileImageUpload}
        handleStudentSave={handleStudentSave}
        isDeleteModalOpen={isDeleteModalOpen}
        isStudentModalOpen={isStudentModalOpen}
        modalMode={modalMode}
        openCreateStudent={openCreateStudent}
        openDeleteConfirm={openDeleteConfirm}
        openEditStudent={openEditStudent}
        openViewProfile={setViewingStudent}
        closeViewProfile={() => setViewingStudent(null)}
        viewingStudent={viewingStudent}
        resetStudentEditor={resetStudentEditor}
        setActiveView={setActiveView}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        setStudentSearch={setStudentSearch}
        studentDeletingId={studentDeletingId}
        studentSearch={studentSearch}
        studentsList={studentsList}
        studentsLoading={studentsLoading}
      />
    );
  }

  return (
    <div className="site-shell">
      <NavBar onNavigate={handleNavClick} onLogout={handleLogout} isLoggedIn={false} />

      <header
        className="hero"
        id="home"
        style={{ "--hero-photo": `url(${heroPhoto})` }}
      >
        <div className="hero-content">
          <p className="eyebrow">Agile software development learning portal</p>
          <h1>Rahul Lab Academy</h1>
          <p className="hero-copy">
            Register students into a modern agile workspace backed by Node.js & MongoDB database.
          </p>
          <div className="hero-actions" aria-label="Student access actions">
            <button className="primary-action" onClick={() => showAuth("register")}>
              Start registration
            </button>
            <button className="secondary-action" onClick={() => showAuth("login")}>
              Student sign in
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="sprint-band" aria-labelledby="sprint-heading">
          <div className="section-inner sprint-layout">
            <div>
              <p className="eyebrow">Built for agile practice</p>
              <h2 id="sprint-heading">A student portal powered by Node.js & MongoDB.</h2>
              <p>
                Students can enter a focused workspace that mirrors the rhythm
                of professional product squads with full MongoDB persistence.
              </p>
            </div>
            <div className="stat-row" aria-label="Portal highlights">
              {stats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-heading">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Sprint workflow</p>
              <h2 id="process-heading">Move from idea to demo with a clear cadence.</h2>
            </div>
            <div className="process-track" aria-label="Agile sprint workflow">
              {sprintSteps.map((step, index) => (
                <article className="process-step" key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="photo-section" aria-labelledby="photos-heading">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Learning by building</p>
              <h2 id="photos-heading">Photo-led spaces for modern software education.</h2>
            </div>
            <div className="photo-grid">
              {photoStories.map((story) => (
                <article className="story-card" key={story.title}>
                  <img src={story.image} alt={`${story.title} with an agile team`} />
                  <div>
                    <h3>{story.title}</h3>
                    <p>{story.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="auth-section" id="auth-form" aria-labelledby="auth-heading">
          <div className="section-inner auth-layout">
            <div className="auth-copy">
              <p className="eyebrow">Student access</p>
              <h2 id="auth-heading">Join the next sprint.</h2>
              <p>
                Create an account or sign back in to store your data securely in MongoDB Compass database.
              </p>
            </div>

            <div className="auth-card">
              <div className="segmented-control" role="tablist" aria-label="Account form">
                <button
                  aria-selected={activeForm === "register"}
                  className={activeForm === "register" ? "is-active" : ""}
                  onClick={() => setActiveForm("register")}
                  role="tab"
                  type="button"
                >
                  Register
                </button>
                <button
                  aria-selected={activeForm === "login"}
                  className={activeForm === "login" ? "is-active" : ""}
                  onClick={() => setActiveForm("login")}
                  role="tab"
                  type="button"
                >
                  Login
                </button>
              </div>

              {activeForm === "register" ? (
                <Registration onSuccess={handleAuthSuccess} />
              ) : (
                <Login onSuccess={handleAuthSuccess} />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StudentChatPanel({ currentUser, studentCount = 0 }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. Ask me anything about your learning, courses, or dashboard!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ai/status`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStatus(data);
        }
      })
      .catch(err => console.error("Failed to check AI status:", err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: {
            studentName: currentUser?.name,
            totalStudents: studentCount,
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.response) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            isDemo: data.isDemo,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't process that. Please try again.",
            isDemo: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please check if the backend server is running.",
          isDemo: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="db-panel" style={{ display: "flex", flexDirection: "column", height: "600px", padding: "20px" }}>
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "1px solid #e0e0e0" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", flex: 1 }}>AI Learning Assistant</h3>
        {aiStatus && !aiStatus.aiEnabled && <span style={{ fontSize: "11px", padding: "4px 8px", background: "#fff3cd", borderRadius: "4px", color: "#856404" }}>Demo Mode</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e8e8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "#6366f1", flexShrink: 0 }}>AI</div>
            )}
            <div style={{ maxWidth: "70%", padding: "10px 12px", borderRadius: "8px", background: msg.role === "assistant" ? "#f0f0f0" : "#6366f1", color: msg.role === "assistant" ? "#333" : "#fff", wordWrap: "break-word", lineHeight: "1.4" }}>
              {msg.content}
              {msg.isDemo && (
                <div style={{ marginTop: "6px", fontSize: "10px", opacity: 0.7, fontStyle: "italic" }}>
                  Add GROQ_API_KEY to backend/.env for full AI features.
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "#fff", flexShrink: 0 }}>
                {(currentUser?.name || "You").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e8e8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "#6366f1", flexShrink: 0 }}>AI</div>
            <div style={{ display: "flex", gap: "4px", padding: "10px 12px", borderRadius: "8px", background: "#f0f0f0", alignItems: "center" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#999", animation: "bounce 1.4s infinite" }}></span>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#999", animation: "bounce 1.4s infinite 0.2s" }}></span>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#999", animation: "bounce 1.4s infinite 0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #e0e0e0", paddingTop: "12px" }}>
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          style={{ flex: 1, padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Send"
          style={{ width: "36px", height: "36px", padding: "6px", border: "none", borderRadius: "6px", background: loading || !input.trim() ? "#d0d0d0" : "#6366f1", color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {aiStatus && !aiStatus.aiEnabled && (
        <div style={{ marginTop: "12px", padding: "8px 10px", background: "#fff3cd", borderRadius: "6px", fontSize: "12px", color: "#856404", textAlign: "center" }}>
          ⚠️ Demo mode - responses simulated
        </div>
      )}
    </div>
  );
}

function StudentExperience({
  currentUser,
  onLogout,
  onLogoutConfirm,
  isLogoutModalOpen,
  closeLogoutModal,
  handleProfileSave,
  handleProfileImageUpload,
  studentsList = [],
  studentsLoading = false,
  fetchStudents,
  filteredStudents = [],
  studentSearch = "",
  setStudentSearch,
  exportStudents,
  openCreateStudent,
  openEditStudent,
  openDeleteConfirm,
  studentDeletingId,
  isStudentModalOpen,
  resetStudentEditor,
  handleStudentSave,
  modalMode,
  editingStudent,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  handleDeleteConfirm,
  deletingStudent,
}) {
  const displayName = currentUser?.name || "Student";
  const firstName = displayName.split(" ")[0] || "Student";
  const joinedDate = formatStudentDate(currentUser?.createdAt, "long");
  const profileImageSrc = getProfileImageUrl(currentUser?.profileImage);
  const [activeStudentView, setActiveStudentView] = useState("dashboard");

  const progressCards = [
    { value: "86%", label: "Course progress" },
    { value: "12", label: "Assignments" },
    { value: "4.8/5", label: "Average rating" },
    { value: "7 days", label: "Current streak" },
  ];

  const courses = [
    { title: "Frontend Development", meta: "React & JavaScript", status: "In progress" },
    { title: "Database Basics", meta: "MongoDB + queries", status: "Upcoming" },
    { title: "Team Sprint Lab", meta: "Agile workflow", status: "On track" },
  ];

  const tasks = [
    { title: "Complete JavaScript module", due: "Today" },
    { title: "Submit React portfolio checkpoint", due: "Tomorrow" },
    { title: "Review team sprint notes", due: "This week" },
  ];

  const renderStudentContent = () => {
    if (activeStudentView === "chat") {
      return (
        <div style={{ marginTop: "30px" }}>
          <StudentChatPanel currentUser={currentUser} studentCount={studentsList.length} />
        </div>
      );
    }

    if (activeStudentView === "profile") {
      return (
        <ProfilePage
          currentUser={currentUser}
          joinedDate={joinedDate}
          onSaveProfile={handleProfileSave}
          onUploadProfileImage={handleProfileImageUpload}
        />
      );
    }

    if (activeStudentView === "courses") {
      return (
        <section className="db-dashboard-grid" style={{ marginTop: "30px" }}>
          <article className="db-panel db-panel-large">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Learning</span>
                <h3>My courses</h3>
              </div>
            </div>
            <div className="db-mini-student-list">
              {courses.map((course) => (
                <div className="db-mini-student-card" key={course.title}>
                  <span className="db-mini-avatar">{course.title.charAt(0)}</span>
                  <span>
                    <strong>{course.title}</strong>
                    <small>{course.meta}</small>
                  </span>
                  <em>{course.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Progress</span>
                <h3>Student roadmap</h3>
              </div>
            </div>
            <div className="db-progress-stack">
              <ProgressRow label="Frontend" value={86} detail="Current module" />
              <ProgressRow label="Backend" value={72} detail="API practice" />
              <ProgressRow label="Database" value={68} detail="MongoDB work" />
              <ProgressRow label="Agile" value={90} detail="Sprint practice" />
            </div>
          </article>
        </section>
      );
    }

    if (activeStudentView === "tasks") {
      return (
        <section className="db-dashboard-grid" style={{ marginTop: "30px" }}>
          <article className="db-panel db-panel-large">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Tasks</span>
                <h3>My workload</h3>
              </div>
            </div>
            <div className="db-mini-student-list">
              {tasks.map((task) => (
                <div className="db-mini-student-card" key={task.title}>
                  <span className="db-mini-avatar">✓</span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>Due {task.due}</small>
                  </span>
                  <em>Open</em>
                </div>
              ))}
            </div>
          </article>

          <article className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Status</span>
                <h3>Today</h3>
              </div>
            </div>
            <div className="db-progress-stack">
              <ProgressRow label="Assigned work" value={72} detail="3 active items" />
              <ProgressRow label="Completed" value={28} detail="1 done" />
              <ProgressRow label="Focus" value={90} detail="Strong momentum" />
            </div>
          </article>
        </section>
      );
    }

    return (
      <>
        <section className="db-hero-panel" aria-label="Student summary">
          <div className="db-welcome-copy">
            <span className="db-status-chip">
              <span />
              Personal account
            </span>
            <h2>Welcome back, {firstName}</h2>
            <p>
              Manage your personal profile, view learning roadmap, and keep your account details current.
            </p>
            <div className="db-hero-actions">
              <button className="db-primary-action" type="button" onClick={() => setActiveStudentView("profile")}>
                View my profile
              </button>
            </div>
          </div>

          <aside className="db-focus-card" aria-label="Student focus">
            <div className="db-focus-header">
              <span>Today Focus</span>
              <strong>Learning sprint</strong>
            </div>
            <ul className="db-focus-list">
              <li>
                <DashboardIcon name="target" />
                <span>
                  <strong>Next milestone</strong>
                  <small>Complete JavaScript module</small>
                </span>
              </li>
              <li>
                <DashboardIcon name="spark" />
                <span>
                  <strong>Project status</strong>
                  <small>React portfolio in progress</small>
                </span>
              </li>
              <li>
                <DashboardIcon name="shield" />
                <span>
                  <strong>Account control</strong>
                  <small>Edit your profile details & records</small>
                </span>
              </li>
            </ul>
          </aside>
        </section>

        <section className="db-kpi-row" aria-label="Student metrics">
          {progressCards.map((card) => (
            <article key={card.label} className="db-kpi-card db-kpi-blue">
              <div className="db-kpi-top">
                <span className="db-kpi-icon"><DashboardIcon name="spark" /></span>
                <span className="db-kpi-trend">Live</span>
              </div>
              <p className="db-kpi-num">{card.value}</p>
              <p className="db-kpi-label">{card.label}</p>
            </article>
          ))}
        </section>

        <section className="db-dashboard-grid" style={{ marginTop: "30px" }}>
          <article className="db-panel db-panel-large">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Learning</span>
                <h3>My courses</h3>
              </div>
            </div>

            <div className="db-mini-student-list">
              {courses.map((course) => (
                <div className="db-mini-student-card" key={course.title}>
                  <span className="db-mini-avatar">{course.title.charAt(0)}</span>
                  <span>
                    <strong>{course.title}</strong>
                    <small>{course.meta}</small>
                  </span>
                  <em>{course.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Progress</span>
                <h3>Student roadmap</h3>
              </div>
            </div>

            <div className="db-progress-stack">
              <ProgressRow label="Frontend" value={86} detail="Current module" />
              <ProgressRow label="Backend" value={72} detail="API practice" />
              <ProgressRow label="Database" value={68} detail="MongoDB work" />
              <ProgressRow label="Agile" value={90} detail="Sprint practice" />
            </div>
          </article>
        </section>
      </>
    );
  };

  return (
    <div className="db-shell" style={{ minHeight: "100vh" }}>
      <aside className="db-sidebar" aria-label="Student navigation">
        <div className="db-logo">
          <span className="db-logo-icon">RL</span>
          <span className="db-logo-text">
            <strong>Rahul Lab</strong>
            <small>Student portal</small>
          </span>
        </div>

        <nav className="db-sidenav">
          <span className="db-sidenav-label">Main</span>
          <button
            className={`db-sidenav-link${activeStudentView === "dashboard" ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveStudentView("dashboard")}
          >
            <DashboardIcon name="layout" />
            Dashboard
          </button>
          <button
            className={`db-sidenav-link${activeStudentView === "profile" ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveStudentView("profile")}
          >
            <DashboardIcon name="profile" />
            Profile
          </button>
          <button
            className={`db-sidenav-link${activeStudentView === "courses" ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveStudentView("courses")}
          >
            <DashboardIcon name="table" />
            My courses
          </button>
          <button
            className={`db-sidenav-link${activeStudentView === "tasks" ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveStudentView("tasks")}
          >
            <DashboardIcon name="target" />
            Tasks
          </button>
          <button
            className={`db-sidenav-link${activeStudentView === "chat" ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveStudentView("chat")}
          >
            <DashboardIcon name="message" />
            AI Assistant
          </button>
        </nav>

        <div className="db-sidebar-user">
          <span className="db-mini-avatar">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt={`${displayName} profile`} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : getInitials(displayName)}
          </span>
          <span>
            <strong>{displayName}</strong>
            <small>Student account</small>
            {(currentUser?.id || currentUser?._id) && (
              <small title={`Full ID: ${currentUser?.id || currentUser?._id}`} style={{ fontSize: "0.68rem", color: "#94a3b8", fontFamily: "monospace", letterSpacing: 0 }}>
                ID: …{(currentUser?.id || currentUser?._id)?.toString().slice(-8)}
              </small>
            )}
          </span>
        </div>

        <button className="db-logout-btn" onClick={onLogout} type="button">
          <DashboardIcon name="logout" />
          Logout
        </button>
      </aside>

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-title">
            <span className="db-page-kicker">Student workspace</span>
            <h1>My Student Workspace</h1>
            <p>Access your profile, learning progress, and student directory records.</p>
          </div>
          <div className="db-topbar-actions">
            <button className="db-icon-btn" onClick={fetchStudents} title="Refresh data" type="button">
              <DashboardIcon name="refresh" />
            </button>
            <button
              className="db-secondary-action"
              disabled={studentsList.length === 0}
              onClick={exportStudents}
              type="button"
            >
              <DashboardIcon name="download" />
              Export
            </button>
            <button
              className="db-avatar db-avatar-btn"
              title="Go to Profile"
              onClick={() => setActiveStudentView("profile")}
              type="button"
            >
              {profileImageSrc ? (
                <img src={profileImageSrc} alt={`${displayName} profile`} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : getInitials(displayName)}
            </button>
          </div>
        </header>

        {renderStudentContent()}
      </main>

      <AIChatWidget currentUser={currentUser} totalStudents={studentsList.length} />

      <StudentModal
        key={editingStudent?._id || editingStudent?.id || "new"}
        isOpen={isStudentModalOpen}
        onClose={resetStudentEditor}
        student={editingStudent}
        onSave={handleStudentSave}
        mode={modalMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        student={deletingStudent}
        loading={studentDeletingId === getStudentId(deletingStudent)}
      />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={onLogoutConfirm}
      />
    </div>
  );
}

function DashboardExperience({
  activeView,
  currentUser,
  deletingStudent,
  editingStudent,
  fetchStudents,
  filteredStudents,
  handleDeleteConfirm,
  handleExportToast,
  handleLogout,
  onLogoutConfirm,
  isLogoutModalOpen,
  closeLogoutModal,
  handleProfileSave,
  handleProfileImageUpload,
  handleStudentSave,
  isDeleteModalOpen,
  isStudentModalOpen,
  modalMode,
  openCreateStudent,
  openDeleteConfirm,
  openEditStudent,
  openViewProfile,
  closeViewProfile,
  viewingStudent,
  resetStudentEditor,
  setActiveView,
  setIsDeleteModalOpen,
  setStudentSearch,
  studentDeletingId,
  studentSearch,
  studentsList,
  studentsLoading,
}) {
  const now = new Date();
  const isAdminUser = currentUser?.role === "admin";
  const joinedDate = formatStudentDate(currentUser?.createdAt, "long");
  const displayName = currentUser?.name || "Student";
  const studentCount = studentsList.length;

  const sortedStudents = [...studentsList].sort((a, b) => {
    const dateA = parseStudentDate(a)?.getTime() || 0;
    const dateB = parseStudentDate(b)?.getTime() || 0;
    return dateB - dateA;
  });
  const newestStudent = sortedStudents[0];
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const recentStudentCount = studentsList.filter((student) => {
    const createdAt = parseStudentDate(student);
    return createdAt ? createdAt >= sevenDaysAgo : false;
  }).length;

  const dailyBuckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      count: studentsList.filter((student) => {
        const createdAt = parseStudentDate(student);
        return createdAt ? createdAt.toDateString() === date.toDateString() : false;
      }).length,
    };
  });
  const maxDailyRegistrations = Math.max(1, ...dailyBuckets.map((bucket) => bucket.count));
  const registrationBars = dailyBuckets.map((bucket) => ({
    ...bucket,
    height: `${Math.max(10, Math.round((bucket.count / maxDailyRegistrations) * 100))}%`,
  }));
  const visiblePercent = studentCount ? Math.round((filteredStudents.length / studentCount) * 100) : 0;
  const workspaceHealth = studentsLoading ? 64 : 98;
  const sprintReadiness = Math.min(100, studentCount ? 56 + studentCount * 6 : 28);

  const viewMeta = {
    dashboard: {
      eyebrow: "Workspace overview",
      title: "Student Operations Dashboard",
      text: "Track registrations, sprint readiness, AI insights, and live student records from one clean command center.",
    },
    students: {
      eyebrow: "Records directory",
      title: "Student Management",
      text: "Search, add, edit, export, and monitor every registered student.",
    },
    activity: {
      eyebrow: "Audit trail",
      title: "Workspace Activity",
      text: "Review the most important account, database, and sprint events.",
    },
    profile: {
      eyebrow: "Account",
      title: "Profile",
      text: "Manage your student profile and account details.",
    },
  }[activeView] || {
    eyebrow: "Workspace",
    title: "Dashboard",
    text: "Manage your student workspace.",
  };

  const exportStudents = (format = "csv") => exportStudentsFile(filteredStudents, format, handleExportToast);

  return (
    <div className="db-shell">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        studentsLoading={studentsLoading}
        studentCount={studentCount}
        handleLogout={handleLogout}
      />

      <main className="db-main" id="dashboard">
        <DashboardTopbar
          viewMeta={viewMeta}
          fetchStudents={fetchStudents}
          exportStudents={exportStudents}
          isAdminUser={isAdminUser}
          studentsListLength={studentsList.length}
          setActiveView={setActiveView}
          displayName={displayName}
          profileImage={currentUser?.profileImage}
        />

        {activeView === "profile" && (
          <ProfilePage
            currentUser={currentUser}
            joinedDate={joinedDate}
            onSaveProfile={handleProfileSave}
            onUploadProfileImage={handleProfileImageUpload}
          />
        )}

        {activeView === "dashboard" && (
          <DashboardView
            currentUser={currentUser}
            studentsList={studentsList}
            filteredStudents={filteredStudents}
            studentsLoading={studentsLoading}
            recentStudentCount={recentStudentCount}
            newestStudent={newestStudent}
            joinedDate={joinedDate}
            registrationBars={registrationBars}
            sprintReadiness={sprintReadiness}
            workspaceHealth={workspaceHealth}
            visiblePercent={visiblePercent}
            openCreateStudent={openCreateStudent}
            setActiveView={setActiveView}
            fetchStudents={fetchStudents}
          />
        )}

        {activeView === "students" && (
          <StudentsView
            filteredStudents={filteredStudents}
            studentCount={studentCount}
            studentsLoading={studentsLoading}
            studentSearch={studentSearch}
            setStudentSearch={setStudentSearch}
            exportStudents={exportStudents}
            isAdminUser={isAdminUser}
            openCreateStudent={openCreateStudent}
            openEditStudent={openEditStudent}
            openViewProfile={openViewProfile}
            openDeleteConfirm={openDeleteConfirm}
            studentDeletingId={studentDeletingId}
          />
        )}

        {activeView === "activity" && (
          <ActivityView
            joinedDate={joinedDate}
            sprintReadiness={sprintReadiness}
            studentsList={studentsList}
            registrationBars={registrationBars}
            studentCount={studentCount}
            recentStudentCount={recentStudentCount}
            newestStudent={newestStudent}
            currentUser={currentUser}
          />
        )}
      </main>

      <AIChatWidget currentUser={currentUser} totalStudents={studentCount} />

      <StudentModal
        key={editingStudent?._id || editingStudent?.id || "new"}
        isOpen={isStudentModalOpen}
        onClose={resetStudentEditor}
        student={editingStudent}
        onSave={handleStudentSave}
        mode={modalMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        student={deletingStudent}
        loading={studentDeletingId === getStudentId(deletingStudent)}
      />

      <StudentProfileModal
        student={viewingStudent}
        onClose={closeViewProfile}
      />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={onLogoutConfirm}
      />
    </div>
  );
}

function MetricCard({ icon, label, value, helper, tone }) {
  return (
    <article className={`db-kpi-card db-kpi-${tone}`}>
      <div className="db-kpi-top">
        <span className="db-kpi-icon">
          <DashboardIcon name={icon} />
        </span>
        <span className="db-kpi-trend">Live</span>
      </div>
      <p className="db-kpi-num">{value}</p>
      <p className="db-kpi-label">{label}</p>
      <p className="db-kpi-helper">{helper}</p>
    </article>
  );
}

function ProgressRow({ label, value, detail }) {
  return (
    <div className="db-progress-row">
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
      <span>{value}%</span>
      <div className="db-progress-track">
        <em style={{ "--progress": `${value}%` }} />
      </div>
    </div>
  );
}

function DashboardIcon({ name }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "activity":
      return <svg {...commonProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case "database":
      return <svg {...commonProps}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;
    case "download":
      return <svg {...commonProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
    case "edit":
      return <svg {...commonProps}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
    case "filter":
      return <svg {...commonProps}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
    case "layout":
      return <svg {...commonProps}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
    case "logout":
      return <svg {...commonProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    case "plus":
      return <svg {...commonProps}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "profile":
      return <svg {...commonProps}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
    case "refresh":
      return <svg {...commonProps}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" /></svg>;
    case "search":
      return <svg {...commonProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case "shield":
      return <svg {...commonProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "spark":
      return <svg {...commonProps}><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" /></svg>;
    case "table":
      return <svg {...commonProps}><path d="M3 3h18v18H3z" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>;
    case "target":
      return <svg {...commonProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
    case "trash":
      return <svg {...commonProps}><polyline points="3 6 5 6 21 6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
    case "users":
    default:
      return <svg {...commonProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  }
}

function NavBar({ onNavigate, onLogout, isLoggedIn }) {
  const brandTarget = isLoggedIn ? "dashboard" : "home";

  return (
    <nav className="nav-bar">
      <a className="brand" href={`#${brandTarget}`} onClick={(event) => onNavigate(event, brandTarget)}>
        Rahul Lab Academy
      </a>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <a href="#dashboard" onClick={(event) => onNavigate(event, "dashboard")}>
              Dashboard
            </a>
            <a href="#logout" onClick={onLogout}>
              Logout
            </a>
          </>
        ) : (
          <>
            <a href="#home" onClick={(event) => onNavigate(event, "home")}>
              Home
            </a>
            <a href="#process-heading" onClick={(event) => onNavigate(event, "process-heading")}>
              Workflow
            </a>
            <a href="#auth-form" onClick={(event) => onNavigate(event, "auth-form", "register")}>
              Register
            </a>
            <a href="#auth-form" onClick={(event) => onNavigate(event, "auth-form", "login")}>
              Login
            </a>
          </>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>Rahul Lab Academy</span>
      <span>Agile software development portal for students.</span>
    </footer>
  );
}

export default App;
