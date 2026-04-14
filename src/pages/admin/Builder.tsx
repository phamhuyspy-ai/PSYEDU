import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../store/builderStore';
import { useSettingsStore } from '../../store/settingsStore';
import { syncFormSchemaWithGas } from '../../services/gasService';
import { Save, Send, PlayCircle, StopCircle, Eye, ArrowLeft, Settings, Loader2 } from 'lucide-react';
import Toolbox from './builder/Toolbox';
import Canvas from './builder/Canvas';
import ConfigPanel from './builder/ConfigPanel';
import LivePreview from './builder/LivePreview';
import ResultConfigModal from './builder/ResultConfigModal';

export default function Builder() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { form, blocks, setForm, updateFormMeta, activeBlockId } = useBuilderStore();
  const { settings } = useSettingsStore();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // In a real app, we would fetch the form data from API here
  useEffect(() => {
    if (!form && formId) {
      // Mock fetch
      setForm({
        id: formId,
        code: 'NEW-FORM',
        title: 'Bảng hỏi mới',
        description: '',
        type: 'survey',
        publish_status: 'draft',
        collection_status: 'closed',
        show_results: true,
        send_email: false,
        reward: { type: 'none', value: '', message: '' },
        alerts: []
      });
    }
  }, [formId, form, setForm]);

  if (!form) return <div className="p-8 text-center">Đang tải...</div>;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncFormSchemaWithGas(form, blocks, settings);
      if (result.success) {
        console.log('GAS Schema Sync Success');
      }
    } catch (err) {
      console.error('GAS Sync Error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveDraft = async () => {
    await handleSync();
    alert('Đã lưu bản nháp và đồng bộ cấu hình bảng!');
  };

  const handlePublish = async () => {
    updateFormMeta({ publish_status: 'published' });
    await handleSync();
    alert('Đã xuất bản và đồng bộ cấu hình bảng!');
  };

  const toggleCollection = () => {
    const newStatus = form.collection_status === 'open' ? 'closed' : 'open';
    updateFormMeta({ collection_status: newStatus });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* Builder Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/forms')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{form.title}</h1>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {form.code}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                form.publish_status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {form.publish_status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                form.collection_status === 'open' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {form.collection_status === 'open' ? 'Đang thu thập' : 'Đóng thu thập'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsResultModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Cấu hình kết quả</span>
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button 
            onClick={handleSaveDraft}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">Lưu nháp</span>
          </button>
          <button 
            onClick={handlePublish}
            disabled={form.publish_status === 'published' || isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span className="hidden sm:inline">Xuất bản</span>
          </button>
          <button 
            onClick={toggleCollection}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors border ${
              form.collection_status === 'open' 
                ? 'text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100' 
                : 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100'
            }`}
          >
            {form.collection_status === 'open' ? (
              <><StopCircle size={16} /><span className="hidden sm:inline">Đóng thu thập</span></>
            ) : (
              <><PlayCircle size={16} /><span className="hidden sm:inline">Mở thu thập</span></>
            )}
          </button>
        </div>
      </header>

      {/* Builder Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-100 relative">
        <div className="flex-1 flex overflow-hidden">
          <Toolbox />
          <Canvas />
          {/* Config Panel - absolute on mobile, static on desktop */}
          <div className={`
            absolute inset-y-0 right-0 z-20 transform transition-transform duration-300 ease-in-out
            lg:relative lg:transform-none lg:z-0
            ${activeBlockId ? 'translate-x-0' : 'translate-x-full lg:hidden'}
          `}>
            <ConfigPanel />
          </div>
        </div>
        
        {/* Live Preview - hidden on mobile, 1/3 width on desktop */}
        <div className="hidden lg:flex lg:w-1/3 flex-col overflow-hidden border-l border-gray-300 bg-white z-10">
          <LivePreview />
        </div>
      </div>

      {isResultModalOpen && (
        <ResultConfigModal onClose={() => setIsResultModalOpen(false)} />
      )}
    </div>
  );
}
