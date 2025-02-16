import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route path="/" element={
              <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician']}>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/patients" element={
              <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                <Patients />
              </PrivateRoute>
            } />
            <Route path="/doctors" element={
              <PrivateRoute allowedRoles={['admin']}>
                <Doctors />
              </PrivateRoute>
            } />
            <Route path="/appointments" element={
              <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse', 'patient']}>
                <Appointments />
              </PrivateRoute>
            } />
            <Route path="/records" element={
              <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse', 'patient']}>
                <MedicalRecords />
              </PrivateRoute>
            } />
            <Route path="/billing" element={
              <PrivateRoute allowedRoles={['admin', 'patient']}>
                <Billing />
              </PrivateRoute>
            } />
            <Route path="/inventory" element={
              <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
                <Inventory />
              </PrivateRoute>
            } />
            <Route path="/pharmacy" element={
              <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
                <Pharmacy />
              </PrivateRoute>
            } />
            <Route path="/laboratory" element={
              <PrivateRoute allowedRoles={['admin', 'lab_technician']}>
                <Laboratory />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;