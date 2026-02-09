/**
 * Demo users for development / testing only.
 * Each has: user object (for Redux) and token (for API/auth).
 */

export const SAMPLE_USERS = {
  provider: {
    token: "dev-token-sample-provider",
    user: {
      id: 1,
      email: "demo.provider@neighbourly.dev",
      firstName: "Sam",
      lastName: "Provider",
      role: "provider",
      phone: "+1234567890",
      bio: "Demo provider – handyman & repairs.",
    },
  },
  seeker: {
    token: "dev-token-sample-seeker",
    user: {
      id: 2,
      email: "demo.seeker@neighbourly.dev",
      firstName: "Alex",
      lastName: "Seeker",
      role: "seeker",
      phone: "+1234567891",
      bio: "Demo seeker – looking for local services.",
    },
  },
  moderator: {
    token: "dev-token-sample-moderator",
    user: {
      id: 3,
      email: "demo.moderator@neighbourly.dev",
      firstName: "Morgan",
      lastName: "Moderator",
      role: "moderator",
      phone: "+1234567892",
      bio: "Demo moderator – community safety.",
    },
  },
  admin: {
    token: "dev-token-sample-admin",
    user: {
      id: 4,
      email: "demo.admin@neighbourly.dev",
      firstName: "Jordan",
      lastName: "Admin",
      role: "admin",
      phone: "+1234567893",
      bio: "Demo admin – platform management.",
    },
  },
};

/**
 * Get sample user + token by role. For dev only.
 * @param {'provider' | 'seeker' | 'moderator' | 'admin'} role
 * @returns {{ user, token } | null}
 */
export const getSampleUserByRole = (role) => {
  const key = role?.toLowerCase();
  if (!key || !SAMPLE_USERS[key]) return null;
  return SAMPLE_USERS[key];
};
