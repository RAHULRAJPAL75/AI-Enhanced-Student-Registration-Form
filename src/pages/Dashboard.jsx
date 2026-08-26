function Dashboard() {
  return (
    <main style={styles.dashboard}>
      <section style={styles.dashboardCard}>
        <p style={styles.eyebrow}>Welcome back</p>
        <h1>Your student dashboard</h1>
        <p style={styles.subtitle}>You have successfully entered the portal.</p>
        <ul style={styles.list}>
          <li>View your classes</li>
          <li>Check attendance</li>
          <li>See upcoming tasks</li>
        </ul>
      </section>
    </main>
  );
}

const styles = {
  dashboard: {
    minHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  dashboardCard: {
    background: "white",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
    width: "100%",
    maxWidth: "480px",
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
  list: {
    paddingLeft: "18px",
    lineHeight: "1.7",
  },
};

export default Dashboard;
