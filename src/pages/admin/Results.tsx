import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Download, 
  ChevronRight, 
  Search, 
  Filter, 
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(submissions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${activeForm?.title || 'submissions'}.xlsx`);
  };

  const openGoogleSheet = () => {
    // Placeholder for Google Sheet integration
    alert('Chức năng mở Google Sheet đang được phát triển.');
  };

  if (!formId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kết quả khảo sát</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chọn một bảng hỏi để xem dữ liệu phản hồi</p>
        </div>

        <div className="grid gap-4">
          {forms.map(f => (
            <button
              key={f.id}
              onClick={() => navigate(`/admin/results/${f.id}`)}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mã: {f.code}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-400 dark:text-gray-500" size={20} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button onClick={() => navigate('/admin/results')} className="hover:text-blue-600 dark:hover:text-blue-400">Kết quả</button>
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-medium">{activeForm?.title}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dữ liệu phản hồi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý và xuất dữ liệu cho bảng hỏi {activeForm?.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={openGoogleSheet}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            <FileSpreadsheet size={18} className="text-green-600 dark:text-green-400" />
            Mở Google Sheet
          </button>
          <button 
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Download size={18} />
            Xuất Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng số phản hồi</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,248</p>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs mt-2 font-medium">
            <span>+12% so với tháng trước</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Điểm trung bình</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">72.5</p>
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs mt-2 font-medium">
            <span>Mức độ: Khá</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Thời gian hoàn thành TB</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">4:30</p>
          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs mt-2 font-medium">
            <span>Phút:Giây</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm người tham gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
              <Filter size={18} />
            </button>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
              <Calendar size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Người tham gia</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Điểm số</th>
                <th className="px-6 py-4">Thời gian nộp</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sub.user}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold",
                      sub.score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      sub.score >= 50 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {sub.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/r/${sub.id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 justify-end"
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
