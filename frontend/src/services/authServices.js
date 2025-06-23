/**
 * authServices encapsulates API calls related to authentication.
 * This helps keep API logic separated from UI components.
 */
export const authServices = {
  /**
   * Sends login credentials to the server and returns JWT token.
   * @param {Object} param0 - Object containing username and password.
   * @returns {Promise<string>} - Resolves to JWT token string.
   * @throws {Error} - Throws error if response is not ok.
   */
  login: async ({ username, password }) => {
    const res = await fetch('http://localhost:3000/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Return the JWT token string to caller
    return data.token;
  },
    register: async (formData) => {
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  },
};
