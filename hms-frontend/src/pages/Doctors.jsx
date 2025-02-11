import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    qualifications: [],
    license_number: '',
    contact_number: '',
    email: '',
    available_days: [],
    available_hours: {
      start: '09:00',
      end: '17:00'
    }
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data);
    } catch (error) {
      toast.error('Error fetching doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([{ ...formData, user_id: (await supabase.auth.getUser()).data.user.id }])
        .select();

      if (error) throw error;

      setDoctors([data[0], ...doctors]);
      setShowForm(false);
      setFormData({
        first_name: '',
        last_name: '',
        specialization: '',
        qualifications: [],
        license_number: '',
        contact_number: '',
        email: '',
        available_days: [],
        available_hours: {
          start: '09:00',
          end: '17:00'
        }
      });
      toast.success('Doctor added successfully');
    } catch (error) {
      toast.error('Error adding doctor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const { error } = await supabase
          .from('doctors')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setDoctors(doctors.filter(doctor => doctor.id !== id));
        toast.success('Doctor deleted successfully');
      } catch (error) {
        toast.error('Error deleting doctor');
      }
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.first_name} ${doctor.last_name} ${doctor.specialization}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Doctor</h2>
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
                <label className="block text-sm font-medium text-gray-700"> Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                <input
                  type="text"
                  placeholder="Enter qualifications separated by commas"
                  value={formData.qualifications.join(', ')}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value.split(',').map(q => q.trim()) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Days</label>
                <div className="mt-2 space-y-2">
                  {weekDays.map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.available_days.includes(day)}
                        onChange={(e) => {
                          const days = e.target.checked
                            ? [...formData.available_days, day]
                            : formData.available_days.filter(d => d !== day);
                          setFormData({ ...formData, available_days: days });
                        }}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={formData.available_hours.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      available_hours: { ...formData.available_hours, start: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={formData.available_hours.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      available_hours: { ...formData.available_hours, end: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
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
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License
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
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doctor.first_name} {doctor.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doctor.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doctor.license_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doctor.contact_number}
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
                        onClick={() => handleDelete(doctor.id)}
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

export default Doctors;