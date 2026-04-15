import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  PenTool, 
  Send, 
  Eye,
  BarChart3,
  X
} from 'lucide-react';
import { useBuilderStore, FormType } from '../../store/builderStore';
import { cn } from '../../lib/utils';

// Mock data
const mockForms: any[] = [];

export default function FormList() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { forms, setForm } = useBuilderStore();

  const [newForm, setNewForm] = useState({
    code: '',
    title: '',
    description: '',
    type: 'survey' as FormType
  });

  const filteredForms = forms.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = crypto.randomUUID();
    setForm({
      id: newId,
      code: newForm.code,
      title: newForm.title,
      description: newForm.description,
      type: newForm.type,
      publish_status: 'draft',
      collection_status: 'closed'
    });
    navigate(`/admin/builder/${newId}`);
  };

  const openBuilder = (form: any) => {
    setForm({
      id: form.id,
      code: form.code,
      title: form.title,
      description: form.description,
      type: form.type || 'survey',
      publish_status: form.status,
      collection_status: form.collection
    });
    navigate(`/admin/builder/${form.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh sách bảng hỏi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý tất cả các bảng hỏi và biểu mẫu của bạn</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={18} />
          Tạo bảng hỏi mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter size={16} />
            Lọc trạng thái
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Thông tin bảng hỏi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Phản hồi</th>
                <th className="px-6 py-4 text-right">Cập nhật</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-base">{form.title}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{form.code}</span>
                      <span className="truncate max-w-xs">{form.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-max",
                        form.type === 'assessment' ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"
                      )}>
                        {form.type === 'assessment' ? 'Lượng giá' : 'Bảng hỏi'}
                      </span>
                      {form.publish_status === 'published' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-max">
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-max">
                          Bản nháp
                        </span>
                      )}
                      {form.collection_status === 'open' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-max">
                          Đang thu thập
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 w-max">
                          Đóng thu thập
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    0
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openBuilder(form)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors tooltip-trigger"
                        title="Mở Builder"
                      >
                        <PenTool size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/publish/${form.id}`)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Xuất bản & Chia sẻ"
                      >
                        <Send size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/results/${form.id}`)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors tooltip-trigger"
                        title="Xem kết quả"
                      >
                        <BarChart3 size={18} />
                      </button>
                      <button 
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Tạo bảng hỏi mới</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã bảng hỏi (Form Code)</label>
                <input 
                  type="text" 
                  required
                  value={newForm.code}
                  onChange={e => setNewForm({...newForm, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="VD: DASS-21"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bảng hỏi</label>
                <input 
                  type="text" 
                  required
                  value={newForm.title}
                  onChange={e => setNewForm({...newForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="VD: Thang đo Trầm cảm, Lo âu, Căng thẳng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea 
                  rows={3}
                  value={newForm.description}
                  onChange={e => setNewForm({...newForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Mô tả mục đích của bảng hỏi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại biểu mẫu</label>
                <select 
                  value={newForm.type}
                  onChange={e => setNewForm({...newForm, type: e.target.value as FormType})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="survey">Bảng hỏi & Khảo sát</option>
                  <option value="assessment">Lượng giá & Đánh giá</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Tạo và Mở Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
