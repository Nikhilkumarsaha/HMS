import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    visit_date: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (first_name, last_name),
          doctors (first_name, last_name, specialization)
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data);
    } catch (error) {
      toast.error('Error fetching medical records');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select('*');
    setDoctors(data || []);
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('*');
    setPatients(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .insert([formData])
        .select();

      if (error) throw error;

      setRecords([data[0], ...records]);
      setShowForm(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        visit_date: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: ''
      });
      toast.success('Medical record added successfully');
    } catch (error) {
      toast.error('Error adding medical record');
    }
  };

  const filteredRecords = records.filter(record =>
    `${record.patients.first_name} ${record.patients.last_name} ${record.diagnosis}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Medical Record</h2>
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
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                <input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prescription</label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    {new Date(record.visit_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium">Patient:</p>
                <p>{record.patients.first_name} {record.patients.last_name}</p>
              </div>
              <div>
                <p className="font-medium">Doctor:</p>
                <p>Dr. {record.doctors.first_name} {record.doctors.last_name}</p>
                <p className="text-sm text-gray-600">{record.doctors.specialization}</p>
              </div>
              <div>
                <p className="font-medium">Diagnosis:</p>
                <p className="text-gray-600">{record.diagnosis}</p>
              </div>
              <div>
                <p className="font-medium">Treatment:</p>
                <p className="text-gray-600">{record.treatment}</p>
              </div>
              {record.prescription && (
                <div>
                  <p className="font-medium">Prescription:</p>
                  <p className="text-gray-600">{record.prescription}</p>
                </div>
              )}
              {record.notes && (
                <div>
                  <p className="font-medium">Notes:</p>
                  <p className="text-gray-600">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicalRecords;