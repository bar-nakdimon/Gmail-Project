import jwtDecode from 'jwt-decode';

export async function fetchWithAuth(url, options = {}, logout, navigate) {
  const headers = options.headers || {};

  // Decode token and inject x-user-id
  const token = headers.Authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.userId) {
        headers['x-user-id'] = parseInt(decoded.userId, 10);  
      }
    } catch (e) {
      console.warn('Invalid token:', e);
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    if (logout) logout();
    if (navigate) navigate('/login', { replace: true });
    throw new Error('Unauthorized, please login again.');
  }

  // Handle all other error statuses
  if (!res.ok) {
    const contentType = res.headers.get('Content-Type') || '';
    let errorMessage = res.statusText;

    if (contentType.includes('application/json')) {
      const errBody = await res.json().catch(() => ({}));
      errorMessage = errBody.error || errorMessage;
    }

    throw new Error(errorMessage || 'Request failed');
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text();
  }
}
