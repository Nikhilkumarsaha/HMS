import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AdminOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const adminId = location.state?.adminId; // Retrieve adminId from navigation state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost/Admin/adminOtp/${adminId}`,
        null,
        { params: { otp } }
      );
      alert(response.data);
      if (response.data === "Account verified successfully!") {
        navigate("/adminLogin");
      }
    } catch (error) {
      alert("OTP verification failed!");
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default AdminOtp;
