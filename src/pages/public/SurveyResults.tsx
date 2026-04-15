import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Share2, ArrowRight, Gift, Mail, Home, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { translations } from '../../lib/translations';
import { cn } from '../../lib/utils';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import ThemeLanguageToggle from '../../components/ThemeLanguageToggle';
import { sendEmailResult } from '../../services/gasService';

export default function SurveyResults() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { form } = useBuilderStore();
  const { language, theme } = useAppStore();
  const { settings } = useSettingsStore();
  const t = translations[language];
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  const passedScore = location.state?.totalScore;
  const passedResults = location.state?.results;

  // Real data or fallback
  const results = passedResults || {
    totalScore: passedScore !== undefined ? passedScore : 0,
    maxScore: 100,
    message: language === 'vi' ? "Cảm ơn bạn đã tham gia khảo sát." : "Thank you for participating in the survey.",
    chartData: [],
    details: [],
    reward: form?.reward?.type !== 'none' ? {
      type: form?.reward?.type || 'none',
      value: form?.reward?.value || '',
      message: form?.reward?.message || ''
    } : null
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('results-content');
    if (!element) return;

    try {
      // Use html-to-image which supports modern CSS like oklch natively via SVG foreignObject
      const imgDataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: theme === 'dark' ? '#030712' : '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      
      // We need to calculate the height based on the element's actual dimensions
      const imgProps = pdf.getImageProperties(imgDataUrl);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgDataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgDataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`ket-qua-khao-sat-${submissionId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(language === 'vi' ? 'Có lỗi xảy ra khi tải PDF. Vui lòng thử lại.' : 'An error occurred while downloading PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await sendEmailResult(
        'user@example.com',
        submissionId || '',
        form?.title || 'Survey',
        results,
        settings
      );
      
      if (result.success) {
        alert(language === 'vi' ? 'Kết quả đã được gửi tới email của bạn!' : 'Results have been sent to your email!');
      } else {
        throw new Error('Send failed');
      }
    } catch (error) {
      alert(language === 'vi' ? 'Có lỗi xảy ra khi gửi email.' : 'An error occurred while sending email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleClaimReward = async () => {
    setIsClaimingReward(true);
    try {
      // Simulate reward delivery logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(language === 'vi' ? 'Phần quà đã được gửi tới email của bạn cùng với kết quả chi tiết!' : 'The gift has been sent to your email along with detailed results!');
    } catch (error) {
      alert(language === 'vi' ? 'Có lỗi xảy ra khi nhận quà.' : 'An error occurred while claiming the gift.');
    } finally {
      setIsClaimingReward(false);
    }
  };

  const { setChatOpen, setChatContext } = useAppStore();

  const handleChatWithExpert = () => {
    const context = `
      Người dùng vừa hoàn thành khảo sát: ${form?.title || 'Khảo sát'}.
      Tổng điểm: ${results.totalScore}/${results.maxScore}.
      Nhận xét: ${results.message}
      Chi tiết từng phần:
      ${results.details.map(d => `- ${d.category}: ${d.score}/100 (${d.interpretation})`).join('\n')}
    `;
    setChatContext(context);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-end">
          <ThemeLanguageToggle />
        </div>

        <div id="results-content" className="space-y-8 bg-gray-50 dark:bg-gray-950 p-4 rounded-3xl">
          {/* Success Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden border border-gray-100 dark:border-gray-700">
              <img src={settings.LOGO_URL} alt="Logo" className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.results.completed}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t.results.subtitle}
            </p>
          </motion.div>

          {/* Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center"
            >
              <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t.results.totalScore}</span>
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - results.totalScore / results.maxScore)}
                    className="text-blue-600 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{results.totalScore}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1">/{results.maxScore}</span>
                </div>
              </div>
              <p className="mt-6 text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {results.message}
              </p>
            </motion.div>

            {/* Radar Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 text-center">{t.results.analysis}</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results.chartData}>
                    <PolarGrid stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#9ca3af', fontSize: 12 }} />
                    <Radar
                      name="Kết quả"
                      dataKey="A"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Detailed Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              {language === 'vi' ? 'Phân tích chi tiết' : 'Detailed Analysis'}
            </h3>
            <div className="space-y-6">
              {results.details.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.interpretation}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                      className={cn(
                        "h-full rounded-full",
                        item.score >= 80 ? "bg-green-500" : item.score >= 50 ? "bg-blue-500" : "bg-orange-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reward Section */}
        {results.reward && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Gift size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-1">{t.results.rewardTitle}</h3>
                <p className="text-blue-100">{results.reward.message}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg font-mono text-lg border border-white/20">
                  {results.reward.value}
                </div>
              </div>
              <button 
                onClick={handleClaimReward}
                disabled={isClaimingReward}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isClaimingReward ? <Loader2 className="animate-spin" size={20} /> : t.results.claimNow}
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleChatWithExpert}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
          >
            <MessageSquare size={20} />
            {language === 'vi' ? 'Trò chuyện với Chuyên gia' : 'Chat with Expert'}
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} 
            {t.results.downloadPdf}
          </button>
          <button 
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isSendingEmail ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />} 
            {t.results.sendEmail}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Home size={20} /> {t.results.backHome}
          </button>
        </div>

        <footer className="text-center text-gray-400 dark:text-gray-600 text-xs pt-8">
          <p>{t.results.submissionId}: {submissionId}</p>
          <p className="mt-1">{settings.APP_NAME} &copy; 2024</p>
        </footer>
      </div>
    </div>
  );
}
