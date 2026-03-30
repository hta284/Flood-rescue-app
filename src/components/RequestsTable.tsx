import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../services/api';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  CheckCircle, 
  UserPlus, 
  XCircle, 
  Eye,
  ArrowUpDown,
  Phone,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { RescueRequestHistory, RequestStatus, URGENCY_LEVELS } from '../types/rescue.types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import VerifyModal from './modals/VerifyModal';
import AssignTeamModal from './modals/AssignTeamModal';
import RequestDetailModal from './RequestDetailModal';

const columnHelper = createColumnHelper<RescueRequestHistory>();

export default function RequestsTable() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const [selectedRequest, setSelectedRequest] = useState<RescueRequestHistory | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['coordinator-requests', pagination.pageIndex, pagination.pageSize, columnFilters],
    queryFn: async () => {
      const statusFilter = columnFilters.find(f => f.id === 'status')?.value;
      const urgencyFilter = columnFilters.find(f => f.id === 'urgencyLevel')?.value;
      
      const response = await axiosInstance.get('/requests', {
        params: {
          page: pagination.pageIndex,
          size: pagination.pageSize,
          status: statusFilter || null,
          urgencyLevel: urgencyFilter || null,
        },
      });
      return response.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.post(`/requests/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-requests'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-stats'] });
    },
  });

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => <span className="font-mono text-xs font-bold text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('addressText', {
      header: 'Địa chỉ',
      cell: info => <div className="max-w-[250px] truncate font-medium text-gray-900" title={info.getValue()}>{info.getValue()}</div>,
    }),
    columnHelper.accessor('urgencyLevel', {
      header: ({ column }) => (
        <button className="flex items-center hover:text-gray-700" onClick={() => column.toggleSorting()}>
          Mức độ <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => {
        const urgency = URGENCY_LEVELS.find(l => l.value === info.getValue());
        return (
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${urgency?.color}`} />
            <span className="text-sm font-medium">{urgency?.label.split(' ')[0]}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Trạng thái',
      cell: info => {
        const status = info.getValue();
        const config: Record<string, { label: string; color: string }> = {
          PENDING: { label: 'Chờ xác minh', color: 'bg-gray-100 text-gray-700' },
          VERIFIED: { label: 'Đã xác minh', color: 'bg-blue-100 text-blue-700' },
          ASSIGNED: { label: 'Đã điều động', color: 'bg-orange-100 text-orange-700' },
          COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
          CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
        };
        const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>{label}</span>;
      },
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <button className="flex items-center hover:text-gray-700" onClick={() => column.toggleSorting()}>
          Thời gian <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => (
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          {format(new Date(info.getValue()), 'HH:mm dd/MM', { locale: vi })}
        </div>
      ),
    }),
    columnHelper.accessor('citizenPhone', {
      header: 'Người dân',
      cell: info => (
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-3 w-3 mr-1" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: info => {
        const request = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { setSelectedRequest(request); setIsDetailModalOpen(true); }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="h-5 w-5" />
            </button>
            
            {request.status === 'PENDING' && (
              <button 
                onClick={() => { setSelectedRequest(request); setIsVerifyModalOpen(true); }}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Xác minh"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            )}

            {(request.status === 'VERIFIED' || request.status === 'PENDING') && (
              <button 
                onClick={() => { setSelectedRequest(request); setIsAssignModalOpen(true); }}
                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Điều động đội"
              >
                <UserPlus className="h-5 w-5" />
              </button>
            )}

            {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
              <button 
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
                    cancelMutation.mutate(request.id);
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hủy yêu cầu"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      },
    }),
  ], [queryClient, cancelMutation]);

  const table = useReactTable({
    data: data?.content || [],
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  });

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-[#FF6B35] animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo ID, địa chỉ..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          />
        </div>

        <select 
          className="bg-white border border-gray-300 rounded-lg text-sm px-4 py-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          value={(table.getColumn('status')?.getFilterValue() as string) || 'ALL'}
          onChange={e => table.getColumn('status')?.setFilterValue(e.target.value === 'ALL' ? '' : e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác minh</option>
          <option value="VERIFIED">Đã xác minh</option>
          <option value="ASSIGNED">Đã điều động</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        <select 
          className="bg-white border border-gray-300 rounded-lg text-sm px-4 py-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          value={(table.getColumn('urgencyLevel')?.getFilterValue() as string) || 'ALL'}
          onChange={e => table.getColumn('urgencyLevel')?.setFilterValue(e.target.value === 'ALL' ? '' : e.target.value)}
        >
          <option value="ALL">Tất cả mức độ</option>
          <option value="CRITICAL">Khẩn cấp</option>
          <option value="HIGH">Cao</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="LOW">Thấp</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const request = row.original as RescueRequestHistory;
              const urgency = request.urgencyLevel;
              const rowColors: Record<string, string> = {
                CRITICAL: 'bg-red-50/50 hover:bg-red-50',
                HIGH: 'bg-orange-50/50 hover:bg-orange-50',
                MEDIUM: 'bg-yellow-50/50 hover:bg-yellow-50',
                LOW: 'bg-white hover:bg-gray-50',
              };
              return (
                <tr key={row.id} className={`border-b border-gray-100 transition-colors ${rowColors[urgency] || 'bg-white hover:bg-gray-50'}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Hiển thị <span className="font-bold text-gray-900">{table.getRowModel().rows.length}</span> trên <span className="font-bold text-gray-900">{data?.totalElements || 0}</span> yêu cầu
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: data?.totalPages || 0 }).map((_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  table.getState().pagination.pageIndex === i
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <VerifyModal 
            isOpen={isVerifyModalOpen} 
            onClose={() => setIsVerifyModalOpen(false)} 
            request={selectedRequest} 
          />
          <AssignTeamModal 
            isOpen={isAssignModalOpen} 
            onClose={() => setIsAssignModalOpen(false)} 
            request={selectedRequest} 
          />
          <RequestDetailModal 
            isOpen={isDetailModalOpen} 
            onClose={() => setIsDetailModalOpen(false)} 
            request={selectedRequest} 
          />
        </>
      )}
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
