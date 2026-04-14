import React, { useState } from 'react';
import { useBuilderStore } from '../../../store/builderStore';
import { X, Plus, Trash2 } from 'lucide-react';

interface ResultConfigModalProps {
  onClose: () => void;
}

export default function ResultConfigModal({ onClose }: ResultConfigModalProps) {
  const { form, updateFormMeta } = useBuilderStore();
  
  // Local state for editing
  const [thankYouMessage, setThankYouMessage] = useState(form?.thank_you_message || 'Cảm ơn bạn đã hoàn thành bảng hỏi!');
  const [showResults, setShowResults] = useState(form?.show_results ?? true);
  const [showRadarChart, setShowRadarChart] = useState(form?.show_radar_chart ?? false);
  const [sendEmail, setSendEmail] = useState(form?.send_email ?? false);
  
  const [rewardType, setRewardType] = useState(form?.reward?.type || 'none');
  const [rewardValue, setRewardValue] = useState(form?.reward?.value || '');
  const [rewardMessage, setRewardMessage] = useState(form?.reward?.message || '');

  const [alerts, setAlerts] = useState(form?.alerts || []);

  const handleSave = () => {
    updateFormMeta({
      thank_you_message: thankYouMessage,
      show_results: showResults,
      show_radar_chart: showRadarChart,
      send_email: sendEmail,
      reward: {
        type: rewardType as any,
        value: rewardValue,
        message: rewardMessage
      },
      alerts: alerts
    });
    onClose();
  };

  const handleAddAlert = () => {
    setAlerts([...alerts, {
      id: crypto.randomUUID(),
      min_score: 0,
      max_score: 100,
      message: 'Thông điệp cảnh báo',
      color: '#ef4444' // red-500
    }]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleUpdateAlert = (id: string, field: string, value: any) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cấu hình Kết quả & Phần thưởng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 0. Cài đặt thời gian */}
          <section className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 border-b pb-2">1. Thời gian thu thập</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian mở (Bắt đầu)</label>
                <input 
                  type="datetime-local" 
                  value={form?.start_date || ''}
                  onChange={(e) => updateFormMeta({ start_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đóng (Kết thúc)</label>
                <input 
                  type="datetime-local" 
                  value={form?.end_date || ''}
                  onChange={(e) => updateFormMeta({ end_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* 1. Hiển thị kết quả */}
          <section className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 border-b pb-2">2. Hiển thị kết quả</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lời cảm ơn</label>
              <textarea 
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập lời cảm ơn..."
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hiển thị bảng kết quả chi tiết cho người dùng</span>
              </label>

              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={showRadarChart}
                  onChange={(e) => setShowRadarChart(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hiển thị biểu đồ dạng lưới (Radar Chart)</span>
              </label>

              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tự động gửi email kết quả (PDF) qua Apps Script</span>
              </label>
            </div>
          </section>

          {/* 2. Phần thưởng / CTA */}
          <section className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 border-b pb-2">3. Phần thưởng / CTA</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại phần thưởng</label>
                <select 
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">Không có</option>
                  <option value="link">Đường dẫn (Link)</option>
                  <option value="voucher">Mã Voucher</option>
                  <option value="qr">Mã QR</option>
                  <option value="file">Tải File</option>
                </select>
              </div>

              {rewardType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị (Link/Mã)</label>
                  <input 
                    type="text" 
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập link, mã voucher..."
                  />
                </div>
              )}
            </div>

            {rewardType !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thông điệp phần thưởng</label>
                <textarea 
                  value={rewardMessage}
                  onChange={(e) => setRewardMessage(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Chúc mừng bạn nhận được..."
                />
              </div>
            )}
          </section>

          {/* 3. Cảnh báo theo điểm */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-md font-medium text-gray-900">4. Cảnh báo theo điểm số</h3>
              <button 
                onClick={handleAddAlert}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus size={16} /> Thêm cảnh báo
              </button>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Chưa có cảnh báo nào được cấu hình.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">Từ điểm</label>
                      <input 
                        type="number" 
                        value={alert.min_score}
                        onChange={(e) => handleUpdateAlert(alert.id, 'min_score', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">Đến điểm</label>
                      <input 
                        type="number" 
                        value={alert.max_score}
                        onChange={(e) => handleUpdateAlert(alert.id, 'max_score', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Thông điệp cảnh báo</label>
                      <input 
                        type="text" 
                        value={alert.message}
                        onChange={(e) => handleUpdateAlert(alert.id, 'message', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                      />
                    </div>
                    <div className="w-16">
                      <label className="block text-xs text-gray-500 mb-1">Màu</label>
                      <input 
                        type="color" 
                        value={alert.color}
                        onChange={(e) => handleUpdateAlert(alert.id, 'color', e.target.value)}
                        className="w-full h-8 cursor-pointer border border-gray-300 rounded"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveAlert(alert.id)}
                      className="mt-6 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
