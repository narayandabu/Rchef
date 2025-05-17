import { Navigate } from 'react-router-dom';
import { isTokenExpired } from './utils/tokenUtils';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired()) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
