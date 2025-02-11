import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (user && (allowedRoles.length === 0 || allowedRoles.includes(userRole))) {
    return children;
  }
  return <Navigate to="/login" />;
}

export default PrivateRoute;