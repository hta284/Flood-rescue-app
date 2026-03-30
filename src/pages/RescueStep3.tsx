import React, { useState, useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  ChevronLeft, 
  Send, 
  AlertCircle, 
  Edit2, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useRescueContext } from '../contexts/RescueContext';
import { URGENCY_LEVELS } from '../types/rescue.types';
import { axiosInstance } from '../services/api';

interface FileWithPreview extends File {
  preview: string;
}

export default function RescueStep3() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { step1Data, step2Data, reset } = useRescueContext();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > 5) {
      alert('Bạn chỉ có thể tải lên tối đa 5 ảnh');
      return;
    }

    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true
  } as any);

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(file => file.name !== name));
  };

  const handleSubmit = async () => {
    if (!step1Data || !step2Data) {
      setError('Thiếu thông tin từ các bước trước. Vui lòng quay lại kiểm tra.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add Step 1 & 2 data
      formData.append('lat', String(step1Data.lat || ''));
      formData.append('lng', String(step1Data.lng || ''));
      formData.append('addressText', step1Data.addressText || '');
      formData.append('urgencyLevel', step1Data.urgencyLevel);
      
      formData.append('description', step2Data.description);
      formData.append('numPeople', String(step2Data.numPeople));
      formData.append('hasInjured', String(step2Data.hasInjured));
      formData.append('hasChildren', String(step2Data.hasChildren));
      formData.append('hasElderly', String(step2Data.hasElderly));
      formData.append('hasPets', String(step2Data.hasPets));

      // Add images
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axiosInstance.post('/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setRequestId(response.data.requestId);
        reset();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestId) {
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
          <h2 className="text-2xl font-bold text-gray-900">Yêu cầu đã được gửi!</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Mã yêu cầu</p>
            <p className="text-xl font-mono font-bold text-[#FF6B35]">{requestId}</p>
          </div>
          <p className="text-gray-600 text-sm">
            Đội cứu hộ đã nhận được thông tin của bạn và sẽ phản hồi sớm nhất có thể. Vui lòng giữ điện thoại bên mình.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 bg-[#FF6B35] text-white font-bold rounded-xl hover:bg-[#e55a2b] transition-colors"
          >
            Xem trạng thái
          </button>
        </motion.div>
      </div>
    );
  }

  const urgencyInfo = URGENCY_LEVELS.find(l => l.value === step1Data?.urgencyLevel);

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
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Bước 3/3</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full w-full transition-all duration-500"></div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 mr-2 text-[#FF6B35]" />
                Xác nhận thông tin
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Step 1 Review */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                <button 
                  onClick={() => navigate('/rescue/step1')}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Vị trí & Mức độ</h4>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold mr-2 flex-shrink-0 ${urgencyInfo?.color}`}>
                      {urgencyInfo?.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{urgencyInfo?.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {step1Data?.addressText || `${step1Data?.lat?.toFixed(6)}, ${step1Data?.lng?.toFixed(6)}`}
                  </p>
                </div>
              </div>

              {/* Step 2 Review */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                <button 
                  onClick={() => navigate('/rescue/step2')}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Tình huống</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">Số người: {step2Data?.numPeople}</p>
                  <p className="text-sm text-gray-600 line-clamp-3 italic">"{step2Data?.description}"</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {step2Data?.hasInjured && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Người bị thương</span>}
                    {step2Data?.hasChildren && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Trẻ em</span>}
                    {step2Data?.hasElderly && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">Người già</span>}
                    {step2Data?.hasPets && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Thú cưng</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Image Upload */}
          <div className="space-y-4">
            <label className="flex items-center text-lg font-semibold text-gray-900">
              <ImageIcon className="h-5 w-5 mr-2 text-[#FF6B35]" />
              Hình ảnh hiện trường (Tối đa 5)
            </label>

            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className="bg-orange-100 p-3 rounded-full mb-3">
                  <Upload className="h-6 w-6 text-[#FF6B35]" />
                </div>
                <p className="text-sm font-medium text-gray-700">Kéo thả hoặc nhấn để chọn ảnh</p>
                <p className="text-xs text-gray-400 mt-1">Định dạng JPG, PNG (Tối đa 5MB/ảnh)</p>
              </div>
            </div>

            {/* Preview List */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {files.map((file) => (
                    <motion.div 
                      key={file.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100"
                    >
                      <img 
                        src={file.preview} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(file.preview)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.name);
                          }}
                          className="bg-white p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[8px] text-white truncate">
                        {file.name}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/rescue/step2')}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center py-4 px-4 border border-gray-300 rounded-xl text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Đang gửi...
                </>
              ) : (
                <>
                  Gửi yêu cầu
                  <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
