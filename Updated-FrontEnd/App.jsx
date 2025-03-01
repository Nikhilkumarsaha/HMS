import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminOtp from "./pages/AdminOtp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/signup" element={<AdminSignup />} />
        <Route path="/otp" element={<AdminOtp />} />
      </Routes>
    </Router>
  );
}

export default App;
