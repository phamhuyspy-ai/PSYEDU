import React, { useState } from 'react';
import { Save, Globe, Youtube, Facebook, Music2, Users, UserPlus, Shield, Trash2, Bot, Sparkles, Key, MessageSquare } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { updateAdminPassword } from '../../services/gasService';

export default function Settings() {
  const { settings, updateSettings } = useSettingsStore();
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Mock managers list
  const [managers, setManagers] = useState([
    { id: '2', name: 'Manager 1', email: 'manager@psyedu.vn', role: 'manager' }
  ]);
  const [newManager, setNewManager] = useState({ name: '', email: '', password: '' });

  const handleAddManager = async () => {
    if (!newManager.name || !newManager.email || !newManager.password) return;
    
    try {
      // Sync with GAS
      const result = await updateAdminPassword(newManager.email, newManager.password, settings);
      if (result.success) {
        setManagers([...managers, { ...newManager, id: Math.random().toString(), role: 'manager' }]);
        setNewManager({ name: '', email: '', password: '' });
        alert('Đã thêm người quản lý mới và đồng bộ vào hệ thống!');
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi đồng bộ người quản lý mới.');
    }
  };

  const handleDeleteManager = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người quản lý này?')) {
      setManagers(managers.filter(m => m.id !== id));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    updateSettings({
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSave = () => {
    // Dữ liệu đã được lưu tự động vào store qua `updateSettings` khi người dùng thay đổi input
    // Ở đây chúng ta chỉ cần thông báo thành công
    alert('Đã lưu cài đặt hệ thống thành công!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Cấu hình các tham số hoạt động của toàn hệ thống</p>
        </div>
        <button 
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Save size={18} />
          Lưu thay đổi
        </button>
      </div>

      <div className="space-y-8">
        {/* App & Org Info */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Thông tin Ứng dụng & Cơ quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-24 h-24 bg-white rounded-xl border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                {settings.LOGO_URL ? (
                  <img src={settings.LOGO_URL} alt="Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-gray-400 text-xs">No Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="LOGO_URL" 
                    value={settings.LOGO_URL} 
                    onChange={handleChange} 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" 
                    placeholder="https://..."
                  />
                </div>
                <p className="text-[10px] text-gray-500 italic">Dán URL ảnh logo của bạn vào đây (hỗ trợ PNG, JPG, SVG)</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên ứng dụng</label>
              <input type="text" name="APP_NAME" value={settings.APP_NAME} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên cơ quan/đơn vị</label>
              <input type="text" name="ORG_NAME" value={settings.ORG_NAME} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input type="text" name="ORG_ADDRESS" value={settings.ORG_ADDRESS} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
              <input type="email" name="ORG_EMAIL" value={settings.ORG_EMAIL} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="text" name="ORG_PHONE" value={settings.ORG_PHONE} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Mạng xã hội & Liên kết</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Globe size={16} className="text-blue-500" />
                Website
              </label>
              <input type="text" name="ORG_WEBSITE" value={settings.ORG_WEBSITE} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Facebook size={16} className="text-blue-600" />
                Facebook
              </label>
              <input type="text" name="SOCIAL_FACEBOOK" value={settings.SOCIAL_FACEBOOK} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Youtube size={16} className="text-red-600" />
                YouTube
              </label>
              <input type="text" name="SOCIAL_YOUTUBE" value={settings.SOCIAL_YOUTUBE} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Music2 size={16} className="text-black" />
                TikTok
              </label>
              <input type="text" name="SOCIAL_TIKTOK" value={settings.SOCIAL_TIKTOK} onChange={handleChange} placeholder="https://tiktok.com/@..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Navigation (Đường dẫn hệ thống)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">APP_URL</label>
              <input type="text" name="APP_URL" value={settings.APP_URL} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SURVEY_BASE_URL</label>
              <input type="text" name="SURVEY_BASE_URL" value={settings.SURVEY_BASE_URL} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        </section>

        {/* Apps Script Bridge */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Apps Script Bridge (Kết nối Google)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">GAS_WEB_APP_URL</label>
              <input type="text" name="GAS_WEB_APP_URL" value={settings.GAS_WEB_APP_URL} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheet ID gốc</label>
              <input type="text" name="GOOGLE_SHEET_ID" value={settings.GOOGLE_SHEET_ID} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive Folder ID</label>
              <input type="text" name="DRIVE_FOLDER_ID" value={settings.DRIVE_FOLDER_ID} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
            </div>
          </div>
        </section>

        {/* Public Runtime */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Public Runtime (Mặc định khi thu thập)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="show_result_after_submit" checked={settings.show_result_after_submit} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Hiển thị kết quả sau khi nộp</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="send_result_email" checked={settings.send_result_email} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Gửi email kết quả cho người dùng</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="require_profile_by_default" checked={settings.require_profile_by_default} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Bắt buộc nhập thông tin cá nhân</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="require_consent_by_default" checked={settings.require_consent_by_default} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Bắt buộc đồng ý điều khoản (Consent)</span>
            </label>
          </div>
        </section>

        {/* CTA Settings */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">5. CTA Settings (Nút kêu gọi hành động)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại CTA mặc định</label>
              <select name="default_cta_type" value={settings.default_cta_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="booking">Đặt lịch (Booking)</option>
                <option value="link">Đường dẫn ngoài</option>
                <option value="none">Không có</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhãn CTA mặc định</label>
              <input type="text" name="default_cta_label" value={settings.default_cta_label} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">SUNNYCARE_BOOKING_URL</label>
              <input type="text" name="SUNNYCARE_BOOKING_URL" value={settings.SUNNYCARE_BOOKING_URL} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="enable_cta_in_result" checked={settings.enable_cta_in_result} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Hiển thị ở trang kết quả</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="enable_cta_in_pdf" checked={settings.enable_cta_in_pdf} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Hiển thị trong file PDF</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="enable_cta_in_email" checked={settings.enable_cta_in_email} onChange={handleChange} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Hiển thị trong Email</span>
            </label>
          </div>
        </section>

        {/* AI Bot Configuration */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bot size={20} className="text-blue-600" />
              Cấu hình AI Bot (Chuyên gia ảo)
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.AI_ENABLED}
                onChange={(e) => updateSettings({ AI_ENABLED: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Kích hoạt Bot</span>
            </label>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Sparkles size={16} />
                  Nhà cung cấp AI
                </label>
                <select 
                  name="AI_PROVIDER"
                  value={settings.AI_PROVIDER}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="gemini">Google Gemini (Khuyên dùng)</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="none">Không sử dụng</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key size={16} />
                  API Key
                </label>
                <input 
                  type="password"
                  name="AI_API_KEY"
                  value={settings.AI_API_KEY}
                  onChange={handleChange}
                  placeholder="Nhập API Key của bạn..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-gray-500 italic">* Để trống nếu sử dụng Key mặc định của hệ thống (chỉ dành cho Gemini)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tên Chuyên gia hiển thị</label>
                <input 
                  type="text"
                  name="AI_EXPERT_NAME"
                  value={settings.AI_EXPERT_NAME}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Model ID</label>
                <input 
                  type="text"
                  name="AI_MODEL"
                  value={settings.AI_MODEL}
                  onChange={handleChange}
                  placeholder="gemini-3-flash-preview"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare size={16} />
                Chỉ dẫn hệ thống (System Prompt)
              </label>
              <textarea 
                name="AI_SYSTEM_PROMPT"
                value={settings.AI_SYSTEM_PROMPT}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Mô tả vai trò và cách ứng xử của Bot..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Globe size={16} />
                Kiến thức chuyên môn (Knowledge Base)
              </label>
              <textarea 
                name="AI_KNOWLEDGE_BASE"
                value={settings.AI_KNOWLEDGE_BASE}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Dán các tài liệu chuyên môn, quy trình hoặc kiến thức mà Bot cần tham khảo tại đây..."
              />
              <p className="text-xs text-gray-500">Bot sẽ sử dụng thông tin này để trả lời người dùng một cách chính xác hơn.</p>
            </div>
          </div>
        </section>

        {/* User Management - Only for Super Admin */}
        {isSuperAdmin && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Quản lý người dùng
            </h2>
            
            <div className="space-y-6">
              {/* Add Manager Form */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserPlus size={16} />
                  Thêm người quản lý mới
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    placeholder="Họ tên"
                    value={newManager.name}
                    onChange={(e) => setNewManager({...newManager, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={newManager.email}
                    onChange={(e) => setNewManager({...newManager, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input 
                    type="password" 
                    placeholder="Mật khẩu"
                    value={newManager.password}
                    onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <button 
                  onClick={handleAddManager}
                  className="mt-3 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Thêm người quản lý
                </button>
              </div>

              {/* Managers List */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {managers.map((m) => (
                      <tr key={m.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {m.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{m.name}</div>
                              <div className="text-sm text-gray-500">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Shield size={12} />
                            Quản lý
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleDeleteManager(m.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Footer Links */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">6. Cấu hình Footer</h2>
          <div className="space-y-4">
            {(settings.FOOTER_LINKS || []).map((link, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={link.label} 
                  onChange={(e) => {
                    const newLinks = [...settings.FOOTER_LINKS];
                    newLinks[index].label = e.target.value;
                    updateSettings({ FOOTER_LINKS: newLinks });
                  }}
                  placeholder="Nhãn"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input 
                  type="text" 
                  value={link.url} 
                  onChange={(e) => {
                    const newLinks = [...settings.FOOTER_LINKS];
                    newLinks[index].url = e.target.value;
                    updateSettings({ FOOTER_LINKS: newLinks });
                  }}
                  placeholder="URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button 
                  onClick={() => {
                    const newLinks = settings.FOOTER_LINKS.filter((_, i) => i !== index);
                    updateSettings({ FOOTER_LINKS: newLinks });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                updateSettings({ FOOTER_LINKS: [...settings.FOOTER_LINKS, { label: '', url: '' }] });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              + Thêm liên kết
            </button>
          </div>
        </section>

        {/* Embed Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">7. Nhúng Website (Embed)</h2>
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Sử dụng mã dưới đây để nhúng danh sách bảng hỏi hoặc một bảng hỏi cụ thể lên website của bạn (Vercel, WordPress, v.v.).</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhúng Cổng thông tin (Danh sách bảng hỏi)</label>
                <div className="relative group">
                  <textarea 
                    readOnly 
                    rows={3}
                    value={`<!-- PSYEDU RESEARCH PORTAL EMBED -->\n<div style="width:100%; overflow:hidden;">\n  <iframe src="${window.location.origin}/forms?embed=true" width="100%" height="800px" frameborder="0" style="border:none;"></iframe>\n</div>`}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 font-mono resize-none focus:ring-0"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white border border-gray-200 text-xs px-2 py-1 rounded shadow-sm hover:bg-gray-50">Copy</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn nhúng WordPress</label>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal ml-4">
                    <li>Trong trình soạn thảo WordPress, thêm khối <strong>Custom HTML</strong>.</li>
                    <li>Dán đoạn mã iframe ở trên vào khối đó.</li>
                    <li>Điều chỉnh <code>height="800px"</code> để phù hợp với giao diện của bạn.</li>
                    <li>Lưu và xem trước trang.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
