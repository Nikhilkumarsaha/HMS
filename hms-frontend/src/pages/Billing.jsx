import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    payment_method: '',
    insurance_claim_id: '',
    insurance_status: 'pending'
  });

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          patients (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data);
    } catch (error) {
      toast.error('Error fetching bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('*');
    setPatients(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([formData])
        .select();

      if (error) throw error;

      setBills([data[0], ...bills]);
      setShowForm(false);
      setFormData({
        patient_id: '',
        amount: '',
        payment_method: '',
        insurance_claim_id: '',
        insurance_status: 'pending'
      });
      toast.success('Bill created successfully');
    } catch (error) {
      toast.error('Error creating bill');
    }
  };

  const updateBillStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setBills(bills.map(bill =>
        bill.id === id ? { ...bill, status } : bill
      ));
      toast.success(`Bill marked as ${status}`);
    } catch (error) {
      toast.error('Error updating bill status');
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bill
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search bills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Bill</h2>
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
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
              {formData.payment_method === 'insurance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance Claim ID</label>
                  <input
                    type="text"
                    value={formData.insurance_claim_id}
                    onChange={(e) => setFormData({ ...formData, insurance_claim_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              )}
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
                  Create
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
          {filteredBills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    ${parseFloat(bill.amount).toFixed(2)}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                  bill.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="font-medium">Patient:</p>
                <p>{bill.patients.first_name} {bill.patients.last_name}</p>
              </div>
              <div>
                <p className="font-medium">Payment Method:</p>
                <p className="capitalize">{bill.payment_method || 'Not specified'}</p>
              </div>
              {bill.insurance_claim_id && (
                <div>
                  <p className="font-medium">Insurance Claim ID:</p>
                  <p>{bill.insurance_claim_id}</p>
                  <p className="text-sm text-gray-600">Status: {bill.insurance_status}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Date:</p>
                <p>{new Date(bill.created_at).toLocaleDateString()}</p>
              </div>
              {bill.status === 'pending' && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => updateBillStatus(bill.id, 'paid')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => updateBillStatus(bill.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Cancel
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

export default Billing;