import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, FlaskRound as Flask } from 'lucide-react';
import toast from 'react-hot-toast';

function Laboratory() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    test_type: '',
    test_date: '',
    results: '',
    notes: ''
  });

  useEffect(() => {
    fetchTests();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .select(`
          *,
          patients (first_name, last_name),
          doctors (first_name, last_name)
        `)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setTests(data);
    } catch (error) {
      toast.error('Error fetching lab tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('*');
    setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select('*');
    setDoctors(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .insert([formData])
        .select();

      if (error) throw error;

      setTests([data[0], ...tests]);
      setShowForm(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        test_type: '',
        test_date: '',
        results: '',
        notes: ''
      });
      toast.success('Lab test added successfully');
    } catch (error) {
      toast.error('Error adding lab test');
    }
  };

  const updateTestStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('lab_tests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setTests(tests.map(test =>
        test.id === id ? { ...test, status } : test
      ));
      toast.success(`Test marked as ${status}`);
    } catch (error) {
      toast.error('Error updating test status');
    }
  };

  const filteredTests = tests.filter(test =>
    test.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.test_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Laboratory</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Test
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Lab Test</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Type</label>
                <input
                  type="text"
                  value={formData.test_type}
                  onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Date</label>
                <input
                  type="date"
                  value={formData.test_date}
                  onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Results</label>
                <textarea
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flask className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{test.test_type}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  test.status === 'completed' ? 'bg-green-100 text-green-800' :
                  test.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  test.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.status.replace('_', ' ').charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="font-medium">Patient:</p>
                <p>{test.patients.first_name} {test.patients.last_name}</p>
              </div>
              <div>
                <p className="font-medium">Doctor:</p>
                <p>Dr. {test.doctors.first_name} {test.doctors.last_name}</p>
              </div>
              <div>
                <p className="font-medium">Test Date:</p>
                <p>{new Date(test.test_date).toLocaleDateString()}</p>
              </div>
              {test.results && (
                <div>
                  <p className="font-medium">Results:</p>
                  <p className="text-gray-600">{test.results}</p>
                </div>
              )}
              {test.notes && (
                <div>
                  <p className="font-medium">Notes:</p>
                  <p className="text-gray-600">{test.notes}</p>
                </div>
              )}
              {test.status === 'pending' && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => updateTestStatus(test.id, 'in_progress')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Start Test
                  </button>
                  <button
                    onClick={() => updateTestStatus(test.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {test.status === 'in_progress' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => updateTestStatus(test.id, 'completed')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    Complete Test
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Laboratory;