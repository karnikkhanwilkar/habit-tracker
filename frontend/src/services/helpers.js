export const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
