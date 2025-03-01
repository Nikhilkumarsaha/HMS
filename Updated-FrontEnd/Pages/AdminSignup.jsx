import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminSignup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "ADMIN",
    phoneNumber: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost/Admin/adminSignup", formData);
      alert(response.data.message); // Show response message
      if (response.data.adminId) { // Check if adminId exists
        navigate("/otp", { state: { adminId: response.data.adminId } });
      }
    } catch (error) {
      alert("Signup failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Admin Signup</h2>
      <form className="bg-white p-6 rounded shadow-md w-96" onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" className="w-full p-2 border mb-2" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" className="w-full p-2 border mb-2" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="w-full p-2 border mb-2" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" className="w-full p-2 border mb-2" onChange={handleChange} required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" className="w-full p-2 border mb-2" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Signup</button>
      </form>
    </div>
  );
}

export default AdminSignup;
