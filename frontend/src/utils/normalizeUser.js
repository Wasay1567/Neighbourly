// Central place to normalize user objects for Redux / UI
// Ensures consistent fields like ID, ROLE, NAME, etc.

/**
 * @param {object} user - Raw user object from API or sample data
 * @returns {object} normalized user
 */
export const normalizeUser = (user = {}) => {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  return {
    ...user,
    id: user.id,
    ID: user.id,
    role: user.role,
    ROLE: user.role?.toUpperCase() || "SEEKER",
    NAME: user.name || `${firstName} ${lastName}`.trim() || user.email,
    firstName,
    lastName,
  };
};

