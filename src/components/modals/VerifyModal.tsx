import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../services/api';
import { RescueRequestHistory } from '../../types/rescue.types';
import { CheckCircle, X, Loader2, MessageSquare } from 'lucide-react';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RescueRequestHistory;
}

export default function VerifyModal({ isOpen, onClose, request }: VerifyModalProps) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (data: { id: string; note: string }) => 
      axiosInstance.post(`/requests/${data.id}/verify`, { note: data.note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-requests'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-stats'] });
      onClose();
      setNote('');
    },
  });

  const handleVerify = () => {
    verifyMutation.mutate({ id: request.id, note });
  };

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Xác minh yêu cầu
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Yêu cầu ID</p>
                    <p className="text-sm font-mono font-bold text-gray-900">{request.id}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                      Ghi chú xác minh (không bắt buộc)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                      placeholder="Nhập ghi chú về tình trạng xác minh..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={verifyMutation.isPending}
                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    onClick={handleVerify}
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Xác nhận xác minh
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
