import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link, Copy, QrCode, Code, ChevronRight, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useBuilderStore } from '../../store/builderStore';

export default function Publish() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { forms, setForms } = useBuilderStore();
  const qrRef = useRef<SVGSVGElement>(null);

  // Mock fetching forms if list is empty
  useEffect(() => {
    if (forms.length === 0) {
      setForms([
        { id: '1', code: 'PHS_01', title: 'Đánh giá Sức khỏe Tâm thần Học đường', description: 'Dành cho học sinh THCS', type: 'survey', publish_status: 'published', collection_status: 'open' },
        { id: '2', code: 'PAR_02', title: 'Khảo sát Ý kiến Phụ huynh', description: 'Về chương trình giáo dục kỹ năng sống', type: 'survey', publish_status: 'draft', collection_status: 'closed' },
      ]);
    }
  }, [forms.length, setForms]);

  const activeForm = forms.find(f => f.id === formId);
  const surveyUrl = `${window.location.origin}/s/${formId || 'demo-form'}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast
  };

  const downloadQR = (format: 'png' | 'svg') => {
    const svg = qrRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (format === 'png') {
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${activeForm?.code || 'survey'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      } else {
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${activeForm?.code || 'survey'}.svg`;
        downloadLink.href = svgUrl;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!formId) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xuất bản & Chia sẻ</h1>
          <p className="text-sm text-gray-500 mt-1">Chọn một bảng hỏi để xem cấu hình chia sẻ</p>
        </div>

        <div className="grid gap-4">
          {forms.map(f => (
            <button
              key={f.id}
              onClick={() => navigate(`/admin/publish/${f.id}`)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${f.publish_status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{f.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{f.code}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${f.publish_status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                      {f.publish_status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </div>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/admin/publish')} className="hover:text-blue-600">Xuất bản</button>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{activeForm?.title}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chia sẻ bảng hỏi</h1>
          <p className="text-sm text-gray-500 mt-1">Mã: {activeForm?.code}</p>
        </div>
        <a 
          href={surveyUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Xem bản trực tiếp <ExternalLink size={16} />
        </a>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-8">
        {/* Link Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Link size={20} className="text-blue-600" />
            Đường dẫn chia sẻ (Public Link)
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-3">Sử dụng đường dẫn này để gửi cho người tham gia.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={surveyUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 font-mono"
            />
            <button 
              onClick={() => handleCopy(surveyUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <QrCode size={20} className="text-blue-600" />
            Mã QR
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Tải mã QR để in ấn hoặc hiển thị trên màn hình.</p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG 
                ref={qrRef}
                value={surveyUrl} 
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-48">
              <button 
                onClick={() => downloadQR('png')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Tải xuống PNG
              </button>
              <button 
                onClick={() => downloadQR('svg')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Tải xuống SVG
              </button>
            </div>
          </div>
        </div>

        {/* Embed Section */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Code size={20} className="text-blue-600" />
            Mã nhúng (Embed Code)
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-3">Nhúng bảng hỏi trực tiếp vào website WordPress hoặc HTML của bạn.</p>
          <div className="relative">
            <textarea 
              readOnly 
              rows={3}
              value={`<iframe src="${surveyUrl}?embed=true" width="100%" height="600px" frameborder="0"></iframe>`}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 font-mono resize-none"
            />
            <button 
              onClick={() => handleCopy(`<iframe src="${surveyUrl}?embed=true" width="100%" height="600px" frameborder="0"></iframe>`)}
              className="absolute top-2 right-2 p-1.5 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
