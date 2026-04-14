import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  PlayCircle, 
  Users, 
  Mail,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../lib/translations';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];

  const stats = [
    { name: language === 'vi' ? 'Tổng số bảng hỏi' : 'Total Forms', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: language === 'vi' ? 'Đã xuất bản' : 'Published', value: '8', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
    { name: language === 'vi' ? 'Đang thu thập' : 'Collecting', value: '5', icon: PlayCircle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    { name: language === 'vi' ? 'Tổng phản hồi' : 'Total Responses', value: '1,248', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    { name: language === 'vi' ? 'Email đã gửi' : 'Emails Sent', value: '856', icon: Mail, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/20' },
  ];

  const recentForms = [
    { id: '1', code: 'DASS-21', title: 'Thang đo Trầm cảm, Lo âu, Căng thẳng', status: 'published', collection: 'open', responses: 450, date: '2023-10-25', type: 'assessment' },
    { id: '2', code: 'PHQ-9', title: 'Bảng hỏi Sức khỏe Bệnh nhân', status: 'published', collection: 'closed', responses: 890, date: '2023-10-20', type: 'assessment' },
    { id: '3', code: 'GAD-7', title: 'Thang đo Rối loạn Lo âu Lan tỏa', status: 'draft', collection: 'closed', responses: 0, date: '2023-10-28', type: 'assessment' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.admin.dashboard}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'vi' ? 'Theo dõi hoạt động và thống kê của hệ thống' : 'Track system activities and statistics'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/forms')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={18} />
          {language === 'vi' ? 'Tạo bảng hỏi mới' : 'Create New Form'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Forms */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'vi' ? 'Bảng hỏi gần đây' : 'Recent Forms'}
          </h2>
          <button 
            onClick={() => navigate('/admin/forms')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {language === 'vi' ? 'Xem tất cả' : 'View All'} &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3">{language === 'vi' ? 'Mã / Tên bảng hỏi' : 'Code / Form Name'}</th>
                <th className="px-6 py-3">{language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th className="px-6 py-3 text-right">{language === 'vi' ? 'Phản hồi' : 'Responses'}</th>
                <th className="px-6 py-3 text-right">{language === 'vi' ? 'Cập nhật' : 'Updated'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{form.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{form.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-max",
                        form.type === 'assessment' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                      )}>
                        {form.type === 'assessment' ? (language === 'vi' ? 'Lượng giá' : 'Assessment') : (language === 'vi' ? 'Bảng hỏi' : 'Survey')}
                      </span>
                      {form.status === 'published' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 w-max">
                          {language === 'vi' ? 'Đã xuất bản' : 'Published'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 w-max">
                          {language === 'vi' ? 'Bản nháp' : 'Draft'}
                        </span>
                      )}
                      {form.collection === 'open' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 w-max">
                          {language === 'vi' ? 'Đang thu thập' : 'Collecting'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                    {form.responses}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                    {form.date}
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

