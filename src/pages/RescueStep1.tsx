import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Navigation, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { URGENCY_LEVELS, UrgencyLevel } from '../types/rescue.types';
import { useRescueContext } from '../contexts/RescueContext';

const step1Schema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  addressText: z.string().optional(),
  urgencyLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
}).refine((data) => (data.lat && data.lng) || (data.addressText && data.addressText.trim().length > 0), {
  message: 'Vui lòng chọn vị trí trên bản đồ hoặc nhập địa chỉ cụ thể',
  path: ['addressText'], // Show error on address field
});

type Step1FormValues = z.infer<typeof step1Schema>;

export default function RescueStep1() {
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  const { setStep1, step1Data } = useRescueContext();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || {
      urgencyLevel: 'MEDIUM',
    },
  });

  const currentLat = watch('lat');
  const currentLng = watch('lng');
  const currentUrgency = watch('urgencyLevel');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('lat', latitude);
        setValue('lng', longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập GPS.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const onSubmit = (data: Step1FormValues) => {
    setStep1(data);
    navigate('/rescue/step2'); 
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header / Progress */}
        <div className="bg-[#FF6B35] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Yêu cầu cứu hộ</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Bước 1/3</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full w-1/3 transition-all duration-500"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Section 1: Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-lg font-semibold text-gray-900">
                <MapPin className="h-5 w-5 mr-2 text-[#FF6B35]" />
                Vị trí của bạn
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex items-center text-sm font-medium text-[#FF6B35] hover:text-[#e55a2b] transition-colors disabled:opacity-50"
              >
                <Navigation className={`h-4 w-4 mr-1 ${isLocating ? 'animate-pulse' : ''}`} />
                {isLocating ? 'Đang định vị...' : 'Lấy vị trí GPS'}
              </button>
            </div>

            <MapPicker 
              lat={currentLat} 
              lng={currentLng} 
              onLocationSelect={(lat, lng) => {
                setValue('lat', lat);
                setValue('lng', lng);
              }} 
            />
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hoặc nhập địa chỉ cụ thể
              </label>
              <textarea
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                  errors.addressText ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                {...control.register('addressText')}
              />
              {errors.addressText && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.addressText.message}
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Urgency */}
          <div className="space-y-4">
            <label className="flex items-center text-lg font-semibold text-gray-900">
              <AlertTriangle className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Mức độ khẩn cấp
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {URGENCY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setValue('urgencyLevel', level.value)}
                  className={`flex items-center p-3 rounded-xl border-2 transition-all text-left ${
                    currentUrgency === level.value 
                      ? `${level.color.replace('bg-', 'border-')} bg-gray-50` 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${level.color}`}>
                    {level.icon}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${currentUrgency === level.value ? 'text-gray-900' : 'text-gray-700'}`}>
                      {level.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {errors.urgencyLevel && (
              <p className="mt-1 text-xs text-red-600">{errors.urgencyLevel.message}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Thông tin vị trí chính xác giúp đội cứu hộ tiếp cận bạn nhanh hơn. 
              Nếu không thể định vị trên bản đồ, hãy mô tả chi tiết địa chỉ và các dấu hiệu nhận biết xung quanh.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] transition-all transform active:scale-[0.98]"
          >
            Tiếp theo
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
