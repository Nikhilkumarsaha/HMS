import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Guitar as Hospital,
  Users,
  Calendar,
  Stethoscope,
  CreditCard,
  Package,
  Pill as Pills,
  FileText,
  FlaskRound as Flask,
  Bell,
  LogOut,
  Settings,
  UserPlus,
  ClipboardList
} from 'lucide-react';

function Layout() {
  const { signOut, user, userRole, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { icon: Hospital, label: 'Dashboard', path: '/', roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician'] },
    ];

    const roleSpecificItems = {
      admin: [
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: FileText, label: 'Medical Records', path: '/records' },
        { icon: CreditCard, label: 'Billing', path: '/billing' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: Pills, label: 'Pharmacy', path: '/pharmacy' },
        { icon: Flask, label: 'Laboratory', path: '/laboratory' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: UserPlus, label: 'User Management', path: '/users' }
      ],
      doctor: [
        { icon: Users, label: 'My Patients', path: '/patients' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: FileText, label: 'Medical Records', path: '/records' },
        { icon: ClipboardList, label: 'Prescriptions', path: '/prescriptions' }
      ],
      patient: [
        { icon: Calendar, label: 'My Appointments', path: '/appointments' },
        { icon: FileText, label: 'My Records', path: '/records' },
        { icon: CreditCard, label: 'My Bills', path: '/billing' },
        { icon: Pills, label: 'Prescriptions', path: '/prescriptions' }
      ],
      nurse: [
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: FileText, label: 'Medical Records', path: '/records' }
      ],
      pharmacist: [
        { icon: Pills, label: 'Pharmacy', path: '/pharmacy' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: FileText, label: 'Prescriptions', path: '/prescriptions' }
      ],
      lab_technician: [
        { icon: Flask, label: 'Laboratory', path: '/laboratory' },
        { icon: FileText, label: 'Test Results', path: '/test-results' }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">HMS</h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                location.pathname === item.path ? 'bg-gray-100' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Hospital Management System
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  {user?.email} ({userRole})
                </span>
                <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;