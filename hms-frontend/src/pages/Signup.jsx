import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Guitar as Hospital } from 'lucide-react';
import toast from 'react-hot-toast';

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient', // Default role
    specialization: '', // For doctors
    licenseNumber: '', // For doctors and nurses
    department: '' // For staff
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (error) throw error;
      
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-6">
          <Hospital className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Lab Technician</option>
            </select>
          </div>

          {/* Conditional fields based on role */}
          {formData.role === 'doctor' && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </>
          )}

          {formData.role === 'nurse' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          )}

          {(formData.role === 'pharmacist' || formData.role === 'lab_technician') && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;