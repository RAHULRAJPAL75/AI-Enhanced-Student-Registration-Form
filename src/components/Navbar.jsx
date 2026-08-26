function Navbar({ onNavigate, onLogout, isLoggedIn }) {
  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>Student Portal</div>
      <div style={styles.navLinks}>
        {isLoggedIn ? (
          <>
            <a href="#dashboard" style={styles.link} onClick={(event) => onNavigate(event, "dashboard")}>Dashboard</a>
            <a href="#" style={styles.link} onClick={(event) => onLogout(event)}>Logout</a>
          </>
        ) : (
          <>
            <a href="#home" style={styles.link} onClick={(event) => onNavigate(event, "home")}>Home</a>
            <a href="#register" style={styles.link} onClick={(event) => onNavigate(event, "auth-form", "register")}>Register</a>
            <a href="#login" style={styles.link} onClick={(event) => onNavigate(event, "auth-form", "login")}>Login</a>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    background: "#0f172a",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  brand: {
    fontSize: "1.3rem",
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "16px",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
};

export default Navbar;
