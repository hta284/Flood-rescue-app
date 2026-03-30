import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../services/api';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Inbox } from 'lucide-react';
import { RequestCard } from './RequestCard';
import RequestDetailModal from './RequestDetailModal';
import { RescueRequestHistory, RequestStatus } from '../types/rescue.types';

interface RequestListResponse {
  content: RescueRequestHistory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export default function RequestList() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<RequestStatus | 'null'>('null');
  const [selectedRequest, setSelectedRequest] = useState<RescueRequestHistory | null>(null);

  const { data, isLoading, isError } = useQuery<RequestListResponse>({
    queryKey: ['my-requests', page, status],
    queryFn: async () => {
      const response = await axiosInstance.get(`/requests/my?page=${page}&size=6&status=${status}`);
      return response.data;
    },
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < (data?.totalPages || 0)) {
      setPage(newPage);
    }
  };

  if (isError) {
    return (
      <div className="bg-red-50 p-8 rounded-2xl text-center border border-red-100">
        <p className="text-red-600 font-bold mb-2">Đã xảy ra lỗi khi tải dữ liệu</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-red-500 underline hover:text-red-700"
        >
          Thử lại ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          Lịch sử yêu cầu
          <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {data?.totalElements || 0}
          </span>
        </h2>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as RequestStatus | 'null');
                setPage(0);
              }}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all w-full"
            >
              <option value="null">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ</option>
              <option value="VERIFIED">Đã xác minh</option>
              <option value="ASSIGNED">Đã điều động</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
          <p className="text-xs text-gray-400 font-medium">Đang tải lịch sử yêu cầu...</p>
        </div>
      ) : data?.content.length === 0 ? (
        <div className="bg-white py-20 rounded-2xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-50 p-4 rounded-full">
              <Inbox className="h-10 w-10 text-gray-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-900">Chưa có yêu cầu nào</p>
            <p className="text-xs text-gray-400">Các yêu cầu cứu hộ của bạn sẽ xuất hiện tại đây.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.content.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onClick={() => setSelectedRequest(request)} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="p-2 rounded-xl border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            {[...Array(data.totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                  page === idx 
                    ? 'bg-[#FF6B35] text-white shadow-lg' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.totalPages - 1}
            className="p-2 rounded-xl border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <RequestDetailModal 
        isOpen={!!selectedRequest}
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
}
