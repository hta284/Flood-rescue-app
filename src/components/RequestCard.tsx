import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { RescueRequestHistory, URGENCY_LEVELS } from '../types/rescue.types';

interface RequestCardProps {
  request: RescueRequestHistory;
  onClick: () => void;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Đang chờ', color: 'bg-gray-100 text-gray-700' },
  VERIFIED: { label: 'Đã xác minh', color: 'bg-blue-100 text-blue-700' },
  ASSIGNED: { label: 'Đã điều động', color: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const urgency = URGENCY_LEVELS.find(l => l.value === request.urgencyLevel);
  const status = STATUS_CONFIG[request.status];

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-gray-400">{request.id}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className={`h-2 w-2 rounded-full ${urgency?.color}`} title={urgency?.label} />
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1 flex items-center">
        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
        {request.addressText || 'Vị trí trên bản đồ'}
      </h3>

      <p className="text-xs text-gray-500 line-clamp-2 mb-4 italic">
        "{request.description}"
      </p>

      <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: vi })}
          </span>
          <span className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {request.numPeople} người
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6B35] transition-colors" />
      </div>
    </div>
  );
}
