import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If no specific roles are required, just check for authentication
  if (user && (allowedRoles.length === 0 || allowedRoles.includes(userRole))) {
    return children;
  }

  // Redirect to login if not authenticated or not authorized
  return <Navigate to="/login" />;
}

export default PrivateRoute;