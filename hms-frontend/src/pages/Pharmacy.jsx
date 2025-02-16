import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Pill, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

function Pharmacy() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category: '',
    quantity: '',
    unit: '',
    unit_price: '',
    reorder_level: '',
    supplier: '',
    expiry_date: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacy_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data);
    } catch (error) {
      toast.error('Error fetching pharmacy items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('pharmacy_items')
        .insert([formData])
        .select();

      if (error) throw error;

      setItems([data[0], ...items]);
      setShowForm(false);
      setFormData({
        name: '',
        generic_name: '',
        category: '',
        quantity: '',
        unit: '',
        unit_price: '',
        reorder_level: '',
        supplier: '',
        expiry_date: ''
      });
      toast.success('Medicine added successfully');
    } catch (error) {
      toast.error('Error adding medicine');
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const { error } = await supabase
        .from('pharmacy_items')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
      toast.success('Quantity updated successfully');
    } catch (error) {
      toast.error('Error updating quantity');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.generic_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pharmacy</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </button>
      </div>

      <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Medicine</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                <input
                  type="text"
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
                <input
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
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
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.quantity <= item.reorder_level && (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="ml-1 text-sm">Low Stock</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">Generic Name:</p>
                <p>{item.generic_name}</p>
              </div>
              <div>
                <p className="font-medium">Category:</p>
                <p className="capitalize">{item.category}</p>
              </div>
              <div>
                <p className="font-medium">Quantity:</p>
                <div className="flex items-center space-x-2">
                  <p>{item.quantity} {item.unit}</p>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium">Unit Price:</p>
                <p>${parseFloat(item.unit_price).toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium">Supplier:</p>
                <p>{item.supplier}</p>
              </div>
              <div>
                <p className="font-medium">Expiry Date:</p>
                <p>{new Date(item.expiry_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Reorder Level:</p>
                <p>{item.reorder_level} {item.unit}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Pharmacy;