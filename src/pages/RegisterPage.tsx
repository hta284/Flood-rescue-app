import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, User, Phone, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../services/authService';
import axios from 'axios';

const registerSchema = z.object({
  fullName: z.string()
    .min(1, 'Vui lòng nhập họ và tên')
    .max(100, 'Họ và tên không được quá 100 ký tự'),
  phone: z.string().regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
    .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  role: z.enum(['CITIZEN', 'RESCUE_TEAM']),
  acceptTerms: z.boolean().refine(val => val === true, 'Bạn phải đồng ý với điều khoản sử dụng'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CITIZEN',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const { confirmPassword, acceptTerms, ...registerData } = data;
      const response = await authService.register({
        ...registerData,
        email: registerData.email || undefined,
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (errorData.error === 'DUPLICATE_PHONE') {
          setServerError('Số điện thoại này đã được đăng ký.');
        } else if (errorData.error === 'DUPLICATE_EMAIL') {
          setServerError('Email này đã được đăng ký.');
        } else if (errorData.error === 'VALIDATION_ERROR') {
          setServerError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
        } else {
          setServerError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      } else {
        setServerError('Lỗi kết nối mạng. Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đăng ký thành công!</h2>
          <p className="text-gray-600">
            Tài khoản của bạn đã được tạo. Hệ thống sẽ tự động chuyển hướng về trang đăng nhập sau vài giây.
          </p>
          <Link 
            to="/login" 
            className="inline-block w-full py-3 px-4 bg-[#FF6B35] text-white font-medium rounded-lg hover:bg-[#e55a2b] transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Tạo tài khoản mới</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tham gia mạng lưới cứu hộ lũ lụt cộng đồng
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence>
            {serverError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start overflow-hidden"
              >
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{serverError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Họ và tên */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nguyễn Văn A"
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0912345678"
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (không bắt buộc)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example@gmail.com"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600 leading-tight">{errors.password.message}</p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {/* Vai trò */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bạn tham gia với vai trò *</label>
              <select
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-[#FF6B35] focus:border-[#FF6B35] sm:text-sm transition-all"
                {...register('role')}
              >
                <option value="CITIZEN">Công dân (Cần hỗ trợ hoặc báo tin)</option>
                <option value="RESCUE_TEAM">Đội cứu hộ (Tình nguyện viên/Chuyên gia)</option>
              </select>
            </div>
          </div>

          {/* Điều khoản */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded cursor-pointer"
                {...register('acceptTerms')}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="font-medium text-gray-700 cursor-pointer">
                Tôi đồng ý với <a href="#" className="text-[#FF6B35] hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-[#FF6B35] hover:underline">Chính sách bảo mật</a>.
              </label>
              {errors.acceptTerms && <p className="mt-1 text-xs text-red-600">{errors.acceptTerms.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#FF6B35] hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-[#FF6B35] hover:text-[#e55a2b] transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
