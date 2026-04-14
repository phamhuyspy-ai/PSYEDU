import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  ChevronRight, 
  Table as TableIcon,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { cn } from '../../lib/utils';

export default function Results() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { forms } = useBuilderStore();
  
  const activeForm = forms.find(f => f.id === formId);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock submissions
  const submissions = [
    { id: 'sub_1', user: 'Nguyễn Văn A', email: 'vana@gmail.com', score: 85, date: '2024-04-12 14:30' },
    { id: 'sub_2', user: 'Trần Thị B', email: 'thib@yahoo.com', score: 62, date: '2024-04-12 15:15' },
    { id: 'sub_3', user: 'Lê Văn C', email: 'vanc@outlook.com', score: 45, date: '2024-04-13 09:00' },
    { id: 'sub_4', user: 'Phạm Thị D', email: 'thid@gmail.com', score: 92, date: '2024-04-13 10:45' },
  ];

  if (!formId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kết quả khảo sát</h1>
          <p className="text-sm text-gray-500 mt-1">Chọn một bảng hỏi để xem dữ liệu phản hồi</p>
        </div>

        <div className="grid gap-4">
          {forms.map(f => (
            <button
              key={f.id}
              onClick={() => navigate(`/admin/results/${f.id}`)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Mã: {f.code}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/admin/results')} className="hover:text-blue-600">Kết quả</button>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{activeForm?.title}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dữ liệu phản hồi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và xuất dữ liệu cho bảng hỏi {activeForm?.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm">
            <FileSpreadsheet size={18} className="text-green-600" />
            Mở Google Sheet
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
            <Download size={18} />
            Xuất Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Tổng số phản hồi</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,248</p>
          <div className="flex items-center gap-1 text-green-600 text-xs mt-2 font-medium">
            <span>+12% so với tháng trước</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Điểm trung bình</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">72.5</p>
          <div className="flex items-center gap-1 text-blue-600 text-xs mt-2 font-medium">
            <span>Mức độ: Khá</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Thời gian hoàn thành TB</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">4:30</p>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-2 font-medium">
            <span>Phút:Giây</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm người tham gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500">
              <Filter size={18} />
            </button>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500">
              <Calendar size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Người tham gia</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Điểm số</th>
                <th className="px-6 py-4">Thời gian nộp</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{sub.user}</td>
                  <td className="px-6 py-4 text-gray-500">{sub.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold",
                      sub.score >= 80 ? "bg-green-100 text-green-700" :
                      sub.score >= 50 ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {sub.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{sub.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/r/${sub.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 justify-end"
                    >
                      Chi tiết <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
