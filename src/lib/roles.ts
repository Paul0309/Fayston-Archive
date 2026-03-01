export function normalizeIdentity(value?: string | null) {
  return value?.trim().toLowerCase() || null;
}

function parseList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveUserRole(params: {
  email?: string | null;
  username?: string | null;
}) {
  const adminEmails = parseList(process.env.ADMIN_EMAILS);
  const adminUsernames = parseList(process.env.ADMIN_USERNAMES);
  const email = normalizeIdentity(params.email);
  const username = normalizeIdentity(params.username);

  if ((email && adminEmails.includes(email)) || (username && adminUsernames.includes(username))) {
    return "ADMIN";
  }

  return "USER";
}

export function isAdminRole(role?: string | null) {
  return role === "ADMIN";
}
