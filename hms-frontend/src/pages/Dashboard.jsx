import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Users, Calendar, AlertCircle, DollarSign, Package, Activity, Pill, FlaskRound as Flask, FileText } from 'lucide-react';

function Dashboard() {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    pendingTests: 0,
    unpaidBills: 0,
    lowStock: 0,
    pendingPrescriptions: 0,
    recentNotifications: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [userRole]);

  const fetchDashboardStats = async () => {
    try {
      switch (userRole) {
        case 'admin':
          await fetchAdminStats();
          break;
        case 'doctor':
          await fetchDoctorStats();
          break;
        case 'nurse':
          await fetchNurseStats();
          break;
        case 'pharmacist':
          await fetchPharmacistStats();
          break;
        case 'lab_technician':
          await fetchLabTechStats();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchAdminStats = async () => {
    const [
      { count: patientsCount },
      { count: appointmentsCount },
      { count: testsCount },
      { count: billsCount },
      { count: lowStockCount },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact' }),
      supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('lab_tests').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('bills').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('inventory').select('*', { count: 'exact' }).lt('quantity', 'reorder_level'),
      supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).limit(5)
    ]);

    setStats({
      totalPatients: patientsCount || 0,
      totalAppointments: appointmentsCount || 0,
      pendingTests: testsCount || 0,
      unpaidBills: billsCount || 0,
      lowStock: lowStockCount || 0,
      recentNotifications: notifications || []
    });
  };

  const fetchDoctorStats = async () => {
    const [
      { count: patientsCount },
      { count: appointmentsCount },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact' }).eq('doctor_id', user.id),
      supabase.from('appointments').select('*', { count: 'exact' }).eq('doctor_id', user.id).eq('status', 'pending'),
      supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).limit(5)
    ]);

    setStats({
      totalPatients: patientsCount || 0,
      totalAppointments: appointmentsCount || 0,
      recentNotifications: notifications || []
    });
  };

  const fetchNurseStats = async () => {
    const [
      { count: appointmentsCount },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).limit(5)
    ]);

    setStats({
      totalAppointments: appointmentsCount || 0,
      recentNotifications: notifications || []
    });
  };

  const fetchPharmacistStats = async () => {
    const [
      { count: lowStockCount },
      { count: prescriptionsCount },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('pharmacy_items').select('*', { count: 'exact' }).lt('quantity', 'reorder_level'),
      supabase.from('prescriptions').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).limit(5)
    ]);

    setStats({
      lowStock: lowStockCount || 0,
      pendingPrescriptions: prescriptionsCount || 0,
      recentNotifications: notifications || []
    });
  };

  const fetchLabTechStats = async () => {
    const [
      { count: pendingTestsCount },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('lab_tests').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).limit(5)
    ]);

    setStats({
      pendingTests: pendingTestsCount || 0,
      recentNotifications: notifications || []
    });
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <StatCard
              icon={Users}
              title="Total Patients"
              value={stats.totalPatients}
              color="bg-blue-500"
            />
            <StatCard
              icon={Calendar}
              title="Pending Appointments"
              value={stats.totalAppointments}
              color="bg-green-500"
            />
            <StatCard
              icon={Activity}
              title="Pending Lab Tests"
              value={stats.pendingTests}
              color="bg-yellow-500"
            />
            <StatCard
              icon={DollarSign}
              title="Unpaid Bills"
              value={stats.unpaidBills}
              color="bg-red-500"
            />
            <StatCard
              icon={Package}
              title="Low Stock Items"
              value={stats.lowStock}
              color="bg-purple-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Unread Notifications"
              value={stats.recentNotifications.length}
              color="bg-orange-500"
            />
          </>
        );

      case 'doctor':
        return (
          <>
            <StatCard
              icon={Users}
              title="My Patients"
              value={stats.totalPatients}
              color="bg-blue-500"
            />
            <StatCard
              icon={Calendar}
              title="Pending Appointments"
              value={stats.totalAppointments}
              color="bg-green-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Unread Notifications"
              value={stats.recentNotifications.length}
              color="bg-orange-500"
            />
          </>
        );

      case 'nurse':
        return (
          <>
            <StatCard
              icon={Calendar}
              title="Today's Appointments"
              value={stats.totalAppointments}
              color="bg-green-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Unread Notifications"
              value={stats.recentNotifications.length}
              color="bg-orange-500"
            />
          </>
        );

      case 'pharmacist':
        return (
          <>
            <StatCard
              icon={Package}
              title="Low Stock Items"
              value={stats.lowStock}
              color="bg-purple-500"
            />
            <StatCard
              icon={Pill}
              title="Pending Prescriptions"
              value={stats.pendingPrescriptions}
              color="bg-blue-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Unread Notifications"
              value={stats.recentNotifications.length}
              color="bg-orange-500"
            />
          </>
        );

      case 'lab_technician':
        return (
          <>
            <StatCard
              icon={Flask}
              title="Pending Tests"
              value={stats.pendingTests}
              color="bg-yellow-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Unread Notifications"
              value={stats.recentNotifications.length}
              color="bg-orange-500"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderStats()}
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Notifications</h2>
        {stats.recentNotifications.length > 0 ? (
          <div className="space-y-4">
            {stats.recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <h3 className="font-medium text-gray-800">{notification.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No new notifications</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;