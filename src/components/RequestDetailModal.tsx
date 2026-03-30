import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Users, AlertTriangle, ShieldCheck, Truck, CheckCircle2, Phone, Star } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { RescueRequestHistory, URGENCY_LEVELS } from '../types/rescue.types';

interface RequestDetailModalProps {
  isOpen: boolean;
  request: RescueRequestHistory | null;
  onClose: () => void;
}

const STATUS_ICONS = {
  PENDING: <Clock className="h-4 w-4 text-gray-400" />,
  VERIFIED: <ShieldCheck className="h-4 w-4 text-blue-500" />,
  ASSIGNED: <Truck className="h-4 w-4 text-orange-500" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  CANCELLED: <X className="h-4 w-4 text-red-500" />,
};

const STATUS_LABELS = {
  PENDING: 'Đang chờ xử lý',
  VERIFIED: 'Đã xác minh thông tin',
  ASSIGNED: 'Đã điều động đội cứu hộ',
  COMPLETED: 'Đã hoàn thành cứu hộ',
  CANCELLED: 'Yêu cầu đã bị hủy',
};

export default function RequestDetailModal({ isOpen, request, onClose }: RequestDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && request && (() => {
        const urgency = URGENCY_LEVELS.find(l => l.value === request.urgencyLevel);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#FF6B35] p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${urgency?.color}`}>
                    {urgency?.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Chi tiết yêu cầu</h2>
                    <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest">{request.id}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Status Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái hiện tại</h3>
              <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {STATUS_ICONS[request.status]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{STATUS_LABELS[request.status]}</p>
                  <p className="text-[10px] text-gray-400">
                    Cập nhật lần cuối: {format(new Date(request.statusHistory[request.statusHistory.length - 1].time), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin vị trí</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{request.addressText || 'Vị trí trên bản đồ'}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 ml-6">Tọa độ: {request.lat.toFixed(6)}, {request.lng.toFixed(6)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin cứu hộ</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                    <Users className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-xs font-bold text-gray-700">{request.numPeople} người</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-xs font-bold text-gray-700">{urgency?.label.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả tình huống</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl italic leading-relaxed">
                "{request.description}"
              </p>
              <div className="flex flex-wrap gap-2">
                {request.hasInjured && <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">Người bị thương</span>}
                {request.hasChildren && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">Trẻ em</span>}
                {request.hasElderly && <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded uppercase">Người già</span>}
                {request.hasPets && <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded uppercase">Thú cưng</span>}
              </div>
            </div>

            {/* Team Info */}
            {request.teamInfo && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đội cứu hộ phụ trách</h3>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{request.teamInfo.teamName}</p>
                      <p className="text-[10px] text-gray-500">{request.teamInfo.memberCount} thành viên</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${request.teamInfo.phone}`}
                    className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg text-blue-600 text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{request.teamInfo.phone}</span>
                  </a>
                </div>
              </div>
            )}

            {/* History Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lịch sử cập nhật</h3>
              <div className="space-y-4 ml-2 border-l-2 border-gray-100 pl-6">
                {request.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-white border-2 border-[#FF6B35]" />
                    <p className="text-xs font-bold text-gray-900">{STATUS_LABELS[history.status]}</p>
                    <p className="text-[10px] text-gray-400 mb-1">{format(new Date(history.time), 'HH:mm - dd/MM/yyyy', { locale: vi })}</p>
                    {history.note && <p className="text-[10px] text-gray-500 italic">Ghi chú: {history.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            {request.status === 'PENDING' && (
              <button className="flex-1 py-3 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors">
                Hủy yêu cầu
              </button>
            )}
            {request.status === 'COMPLETED' && (
              <button className="flex-1 py-3 bg-[#FF6B35] text-white text-sm font-bold rounded-xl hover:bg-[#e55a2b] transition-colors flex items-center justify-center">
                <Star className="h-4 w-4 mr-2" />
                Đánh giá cứu hộ
              </button>
            )}
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
      )})()}
    </AnimatePresence>
  );
}
