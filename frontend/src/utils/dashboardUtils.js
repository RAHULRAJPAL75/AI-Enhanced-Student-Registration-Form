export function parseStudentDate(student) {
  if (!student?.createdAt) {
    return null;
  }
  const date = new Date(student.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatStudentDate(dateInput, format = "short") {
  if (!dateInput) {
    return "Recently";
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: format === "long" ? "long" : "short",
    year: "numeric",
  });
}

export function getInitials(name = "Student") {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "S";
}

export function getProfileImageUrl(profileImage) {
  if (!profileImage) {
    return "";
  }

  const apiOrigin = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return profileImage.startsWith("/")
    ? `${apiOrigin}${profileImage}`
    : profileImage;
}

export function escapeCsv(value) {
  const safeValue = String(value ?? "");
  if (/[",\n]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}

export function getStudentId(student) {
  return student?._id || student?.id;
}
