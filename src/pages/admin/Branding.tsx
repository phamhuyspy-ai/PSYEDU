import React, { useState } from 'react';
import { Save, Upload, Type, Palette } from 'lucide-react';

export default function Branding() {
  const [primaryColor, setPrimaryColor] = useState('#2563eb'); // blue-600
  const [secondaryColor, setSecondaryColor] = useState('#f8fafc'); // slate-50
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [logoUrl, setLogoUrl] = useState('');

  const handleSave = () => {
    alert('Đã lưu cấu hình thương hiệu thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thương hiệu</h1>
          <p className="text-sm text-gray-500 mt-1">Tùy chỉnh giao diện bảng hỏi theo nhận diện thương hiệu của bạn.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cấu hình */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-gray-500" />
              Logo đơn vị
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">Chưa có logo</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  type="file" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">Hỗ trợ PNG, JPG. Tối đa 2MB. Ảnh sẽ được tự động nén.</p>
              </div>
            </div>
          </div>

          {/* Màu sắc */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette size={20} className="text-gray-500" />
              Màu sắc
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Màu chính (Primary)</label>
                  <p className="text-xs text-gray-500">Dùng cho nút bấm, viền active</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500">{primaryColor}</span>
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Màu phụ (Secondary)</label>
                  <p className="text-xs text-gray-500">Dùng cho nền phụ, highlight nhẹ</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500">{secondaryColor}</span>
                  <input 
                    type="color" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Màu nền (Background)</label>
                  <p className="text-xs text-gray-500">Màu nền tổng thể của bảng hỏi</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500">{backgroundColor}</span>
                  <input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Phông chữ */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Type size={20} className="text-gray-500" />
              Phông chữ
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phông chữ chính</label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
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
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 flex flex-col items-center justify-center min-h-[500px]">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Xem trước giao diện</h3>
          
          <div 
            className="w-full max-w-sm rounded-xl shadow-lg overflow-hidden transition-all"
            style={{ backgroundColor, fontFamily }}
          >
            <div className="h-2" style={{ backgroundColor: primaryColor }}></div>
            <div className="p-6">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 mb-4" />
              ) : (
                <div className="h-10 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              )}
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tiêu đề bảng hỏi</h2>
              <p className="text-sm text-gray-600 mb-6">Mô tả ngắn gọn về bảng hỏi sẽ hiển thị ở đây.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">1. Câu hỏi ví dụ?</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded border border-gray-200" style={{ backgroundColor: secondaryColor }}>
                      <input type="radio" name="demo" className="w-4 h-4" style={{ accentColor: primaryColor }} checked readOnly />
                      <span className="text-sm text-gray-700">Lựa chọn 1</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-white">
                      <input type="radio" name="demo" className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Lựa chọn 2</span>
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
