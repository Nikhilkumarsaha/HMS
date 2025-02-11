import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    address: '',
    medical_history: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data);
    } catch (error) {
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{ ...formData, user_id: (await supabase.auth.getUser()).data.user.id }])
        .select();

      if (error) throw error;

      setPatients([data[0], ...patients]);
      setShowForm(false);
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        address: '',
        medical_history: ''
      });
      toast.success('Patient added successfully');
    } catch (error) {
      toast.error('Error adding patient');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setPatients(patients.filter(patient => patient.id !== id));
        toast.success('Patient deleted successfully');
      } catch (error) {
        toast.error('Error deleting patient');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Medical History</label>
                <textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.contact_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Patients;