import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, LayoutDashboard, Map as MapIcon, History } from 'lucide-react';
import RequestList from '../components/RequestList';
import LiveMap from '../components/LiveMap';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF6B35] p-2 rounded-xl">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">RESCUE<span className="text-[#FF6B35]">HUB</span></h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Chào mừng, {user?.fullName?.split(' ').pop()}!</h2>
            <p className="text-sm text-gray-400 font-medium">Theo dõi các yêu cầu cứu hộ và tình hình thực tế tại khu vực của bạn.</p>
          </div>
          <button 
            onClick={() => navigate('/rescue/step1')}
            className="flex items-center justify-center space-x-2 bg-[#FF6B35] text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-[#e55a2b] hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>Gửi yêu cầu cứu hộ mới</span>
          </button>
        </div>

        {/* Live Map Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900">Bản đồ cứu hộ trực tuyến</h3>
          </div>
          <LiveMap />
        </section>

        {/* Request History Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900">Lịch sử yêu cầu của tôi</h3>
          </div>
          <RequestList />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-medium">© 2026 Hệ thống Cứu hộ Lũ lụt Quốc gia. Luôn đồng hành cùng bạn.</p>
        </div>
      </footer>
    </div>
  );
}
