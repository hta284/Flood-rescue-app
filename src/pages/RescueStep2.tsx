import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRescueContext } from '../contexts/RescueContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  Baby, 
  UserPlus, 
  HeartPulse, 
  Dog 
} from 'lucide-react';

const step2Schema = z.object({
  description: z.string()
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(1000, 'Mô tả không được quá 1000 ký tự'),
  numPeople: z.number()
    .min(1, 'Số người tối thiểu là 1')
    .max(100, 'Số người tối đa là 100'),
  hasInjured: z.boolean(),
  hasChildren: z.boolean(),
  hasElderly: z.boolean(),
  hasPets: z.boolean(),
});

type Step2FormValues = z.infer<typeof step2Schema>;

export default function RescueStep2() {
  const navigate = useNavigate();
  const { setStep2, step2Data } = useRescueContext();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data || {
      description: '',
      numPeople: 1,
      hasInjured: false,
      hasChildren: false,
      hasElderly: false,
      hasPets: false,
    },
  });

  const descriptionValue = watch('description');

  const onSubmit = (data: Step2FormValues) => {
    setStep2(data);
    navigate('/rescue/step3');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header / Progress */}
        <div className="bg-[#FF6B35] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Yêu cầu cứu hộ</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Bước 2/3</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full w-2/3 transition-all duration-500"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Section 1: Description */}
          <div className="space-y-4">
            <label className="flex items-center text-lg font-semibold text-gray-900">
              <MessageSquare className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Mô tả tình huống
            </label>
            <div className="relative">
              <textarea
                className={`block w-full px-4 py-3 border rounded-xl focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={5}
                placeholder="Ví dụ: Nước đang dâng cao đến tầng 2, nhà có 3 người đang ở trên mái tôn, cần thuyền cứu hộ gấp..."
                {...register('description')}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                <span className={descriptionValue.length < 20 ? 'text-red-400' : 'text-green-500'}>
                  {descriptionValue.length}
                </span>
                /1000
              </div>
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.description.message}
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Number of People */}
          <div className="space-y-4">
            <label className="flex items-center text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Số người cần cứu
            </label>
            <div className="max-w-[200px]">
              <input
                type="number"
                min="1"
                max="100"
                className={`block w-full px-4 py-3 border rounded-xl focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                  errors.numPeople ? 'border-red-300' : 'border-gray-300'
                }`}
                {...register('numPeople', { valueAsNumber: true })}
              />
            </div>
            {errors.numPeople && (
              <p className="mt-1 text-xs text-red-600">{errors.numPeople.message}</p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Additional Info */}
          <div className="space-y-4">
            <label className="flex items-center text-lg font-semibold text-gray-900">
              <UserPlus className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Thông tin bổ sung
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
                  {...register('hasInjured')}
                />
                <div className="ml-3 flex items-center">
                  <HeartPulse className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Có người bị thương</span>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
                  {...register('hasChildren')}
                />
                <div className="ml-3 flex items-center">
                  <Baby className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Có trẻ em</span>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
                  {...register('hasElderly')}
                />
                <div className="ml-3 flex items-center">
                  <Users className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Có người già</span>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
                  {...register('hasPets')}
                />
                <div className="ml-3 flex items-center">
                  <Dog className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Có thú cưng</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/rescue/step1')}
              className="flex-1 flex items-center justify-center py-4 px-4 border border-gray-300 rounded-xl text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Quay lại
            </button>
            <button
              type="submit"
              className="flex-[2] flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] transition-all transform active:scale-[0.98]"
            >
              Tiếp theo
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
