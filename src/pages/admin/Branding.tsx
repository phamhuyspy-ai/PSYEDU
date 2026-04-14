import React, { useState, useRef } from 'react';
import { Save, Upload, Type, Palette, X, Loader2 } from 'lucide-react';

export default function Branding() {
  const [primaryColor, setPrimaryColor] = useState('#2563eb'); // blue-600
  const [secondaryColor, setSecondaryColor] = useState('#f8fafc'); // slate-50
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log({ primaryColor, secondaryColor, backgroundColor, fontFamily, logoUrl });
      alert('Đã lưu cấu hình thương hiệu thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu cấu hình. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic size check (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.');
      return;
    }

    // Compress image
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setLogoUrl(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thương hiệu</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tùy chỉnh giao diện bảng hỏi theo nhận diện thương hiệu của bạn.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={18} />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cấu hình */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload size={20} className="text-gray-500 dark:text-gray-400" />
              Logo đơn vị
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    <button 
                      onClick={removeLogo}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm p-2 text-center">Chưa có logo</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-blue-900/30 dark:file:text-blue-400
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Hỗ trợ PNG, JPG. Tối đa 2MB. Ảnh sẽ được tự động nén.</p>
              </div>
            </div>
          </div>

          {/* Màu sắc */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette size={20} className="text-gray-500 dark:text-gray-400" />
              Màu sắc
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Màu chính (Primary)</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dùng cho nút bấm, viền active</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{primaryColor}</span>
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Màu phụ (Secondary)</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dùng cho nền phụ, highlight nhẹ</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{secondaryColor}</span>
                  <input 
                    type="color" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Màu nền (Background)</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Màu nền tổng thể của bảng hỏi</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{backgroundColor}</span>
                  <input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Phông chữ */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Type size={20} className="text-gray-500 dark:text-gray-400" />
              Phông chữ
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chọn phông chữ chính</label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Inter">Inter (Mặc định)</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[500px]">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Xem trước giao diện</h3>
          
          <div 
            className="w-full max-w-sm rounded-xl shadow-lg overflow-hidden transition-all"
            style={{ backgroundColor, fontFamily }}
          >
            <div className="h-2" style={{ backgroundColor: primaryColor }}></div>
            <div className="p-6">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 mb-4" />
              ) : (
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
              )}
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tiêu đề bảng hỏi</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Mô tả ngắn gọn về bảng hỏi sẽ hiển thị ở đây.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">1. Câu hỏi ví dụ?</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700" style={{ backgroundColor: secondaryColor }}>
                      <input type="radio" name="demo" className="w-4 h-4" style={{ accentColor: primaryColor }} checked readOnly />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Lựa chọn 1</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <input type="radio" name="demo" className="w-4 h-4" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Lựa chọn 2</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  className="w-full py-2 px-4 rounded-md text-white font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Gửi câu trả lời
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
