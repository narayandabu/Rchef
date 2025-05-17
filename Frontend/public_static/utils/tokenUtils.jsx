export const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
  
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000); // current time in seconds
  
    return now > expiry;
  };
  