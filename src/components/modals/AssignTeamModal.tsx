import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../services/api';
import { RescueRequestHistory, AvailableTeam } from '../../types/rescue.types';
import { UserPlus, X, Loader2, MapPin, Users, Activity, Phone, Star } from 'lucide-react';

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RescueRequestHistory;
}

export default function AssignTeamModal({ isOpen, onClose, request }: AssignTeamModalProps) {
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const { data: teams, isLoading } = useQuery<AvailableTeam[]>({
    queryKey: ['available-teams'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teams/available');
      return response.data;
    },
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (teamId: string) => 
      axiosInstance.post(`/requests/${request.id}/assign`, { teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-requests'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-stats'] });
      onClose();
      setSelectedTeamId(null);
    },
  });

  const handleAssign = () => {
    if (selectedTeamId) {
      assignMutation.mutate(selectedTeamId);
    }
  };

  // Simple recommendation logic: closest team with lowest workload
  const recommendedTeam = teams?.reduce((prev, curr) => {
    if (!prev) return curr;
    // Score = distance * workload (lower is better)
    const prevScore = prev.distance * (prev.currentWorkload + 1);
    const currScore = curr.distance * (curr.currentWorkload + 1);
    return currScore < prevScore ? curr : prev;
  }, null as AvailableTeam | null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 flex items-center">
                    <UserPlus className="h-6 w-6 text-orange-600 mr-2" />
                    Điều động đội cứu hộ
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2 space-y-6">
                  {/* Request Summary */}
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs text-orange-600 uppercase tracking-wider font-bold">Yêu cầu cứu hộ</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{request.id}</p>
                      <p className="text-sm text-gray-700 font-medium">{request.addressText}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Mức độ</p>
                      <span className="text-sm font-bold text-red-600">{request.urgencyLevel}</span>
                    </div>
                  </div>

                  {/* Teams List */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center uppercase tracking-wider">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      Đội cứu hộ khả dụng
                    </h4>

                    {isLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                        <p className="text-sm text-gray-500">Đang tìm kiếm các đội gần nhất...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {teams?.map((team) => {
                          const isRecommended = team.id === recommendedTeam?.id;
                          const isSelected = team.id === selectedTeamId;

                          return (
                            <button
                              key={team.id}
                              onClick={() => setSelectedTeamId(team.id)}
                              className={`p-4 rounded-xl border-2 transition-all text-left relative group ${
                                isSelected 
                                  ? 'border-orange-500 bg-orange-50/30' 
                                  : 'border-gray-100 hover:border-orange-200 hover:bg-gray-50'
                              }`}
                            >
                              {isRecommended && (
                                <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm">
                                  <Star className="h-3 w-3 mr-1 fill-white" />
                                  ĐỀ XUẤT HỆ THỐNG
                                </div>
                              )}

                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <h5 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{team.teamName}</h5>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" /> {team.distance} km
                                    </span>
                                    <span className="flex items-center">
                                      <Users className="h-3 w-3 mr-1" /> {team.memberCount} người
                                    </span>
                                    <span className="flex items-center">
                                      <Activity className="h-3 w-3 mr-1" /> Tải: {team.currentWorkload} nv
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                    <Phone className="h-3 w-3 mr-1" /> {team.phone}
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={!selectedTeamId || assignMutation.isPending}
                    className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-[#FF6B35] rounded-xl hover:bg-[#e55a2b] transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg shadow-orange-200"
                    onClick={handleAssign}
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    Xác nhận điều động đội
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
