import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../services/api';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Activity, 
  AlertCircle,
  RefreshCcw,
  LogOut,
  User
} from 'lucide-react';
import { CoordinatorStats } from '../types/rescue.types';
import RequestsTable from '../components/RequestsTable';
import { useAuth } from '../hooks/useAuth';

export default function CoordinatorDashboard() {
  const { user, logout } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: stats, refetch: refetchStats } = useQuery<CoordinatorStats>({
    queryKey: ['coordinator-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/requests/stats');
      setLastUpdated(new Date());
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 ${bgColor} flex items-center space-x-4`}>
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '...'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF6B35] p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Coordinator Panel</h1>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin-slow" />
                Cập nhật: {lastUpdated.toLocaleTimeString()}
              </div>
              
              <div className="flex items-center space-x-4 border-l pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{user?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User className="h-6 w-6" />
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            title="Chờ xác minh" 
            value={stats?.pending} 
            icon={Clock} 
            color="bg-gray-500" 
            bgColor="bg-white" 
          />
          <StatCard 
            title="Đã xác minh" 
            value={stats?.verified} 
            icon={CheckCircle2} 
            color="bg-blue-500" 
            bgColor="bg-white" 
          />
          <StatCard 
            title="Đã điều động" 
            value={stats?.assigned} 
            icon={Truck} 
            color="bg-orange-500" 
            bgColor="bg-white" 
          />
          <StatCard 
            title="Đang thực hiện" 
            value={stats?.inProgress} 
            icon={Activity} 
            color="bg-indigo-500" 
            bgColor="bg-white" 
          />
          <StatCard 
            title="Hoàn thành (Hôm nay)" 
            value={stats?.completedToday} 
            icon={CheckCircle2} 
            color="bg-green-600" 
            bgColor="bg-green-50" 
          />
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Danh sách yêu cầu cứu hộ</h2>
            <button 
              onClick={() => refetchStats()}
              className="flex items-center text-sm text-[#FF6B35] font-medium hover:underline"
            >
              <RefreshCcw className="h-4 w-4 mr-1" /> Làm mới
            </button>
          </div>
          <RequestsTable />
        </div>
      </main>
    </div>
  );
}
