import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (first_name, last_name),
          doctors (first_name, last_name, specialization)
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data);
    } catch (error) {
      toast.error('Error fetching appointments');
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
        .from('appointments')
        .insert([formData])
        .select();

      if (error) throw error;

      setAppointments([...appointments, data[0]]);
      setShowForm(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        notes: ''
      });
      toast.success('Appointment scheduled successfully');
    } catch (error) {
      toast.error('Error scheduling appointment');
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setAppointments(appointments.map(apt =>
        apt.id === id ? { ...apt, status } : apt
      ));
      toast.success(`Appointment ${status}`);
    } catch (error) {
      toast.error('Error updating appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Schedule Appointment</h2>
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
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
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
                  Schedule
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
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Patient:</p>
                    <p>{appointment.patients.first_name} {appointment.patients.last_name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Doctor:</p>
                    <p>Dr. {appointment.doctors.first_name} {appointment.doctors.last_name}</p>
                    <p className="text-sm text-gray-600">{appointment.doctors.specialization}</p>
                  </div>
                  <div>
                    <p className="font-medium">Reason:</p>
                    <p className="text-gray-600">{appointment.reason}</p>
                  </div>
                  {appointment.notes && (
                    <div>
                      <p className="font-medium">Notes:</p>
                      <p className="text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <div className="space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;