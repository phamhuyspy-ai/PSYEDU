import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useBuilderStore } from '../../store/builderStore';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { translations } from '../../lib/translations';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Send, AlertCircle, CheckCircle2, Sparkles, Trophy, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import ThemeLanguageToggle from '../../components/ThemeLanguageToggle';

export default function SurveyRunner() {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const navigate = useNavigate();
  const { language, theme } = useAppStore();
  const { settings } = useSettingsStore();
  const t = translations[language];
  
  // In a real app, we would fetch the form data from API/GAS
  const { forms, blocks: storeBlocks } = useBuilderStore();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(-1); // -1 for contact info step
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [activeEncouragement, setActiveEncouragement] = useState<any>(null);

  const activeForm = forms.find(f => f.id === formId) || {
    id: 'default',
    code: 'SURVEY',
    title: language === 'vi' ? 'Bảng hỏi khảo sát' : 'Survey Questionnaire',
    description: language === 'vi' ? 'Vui lòng hoàn thành các câu hỏi dưới đây.' : 'Please complete the questions below.',
    reward: { type: 'none', value: '', message: '' },
    encouragement_messages: [
      { id: 'e1', after_block_index: 1, message: t.runner.encouragement.motivation, type: 'motivation' },
      { id: 'e2', after_block_index: 2, message: t.runner.encouragement.success, type: 'success' }
    ]
  };

  // Mock blocks if store is empty
  const blocks: any[] = storeBlocks;

  const isContactStep = currentBlockIndex === -1;
  const currentBlock = blocks[currentBlockIndex];
  const isFirst = currentBlockIndex === -1;
  const isLast = currentBlockIndex === blocks.length - 1;

  const handleNext = () => {
    if (isContactStep) {
      if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
        setError(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin liên hệ bắt buộc.' : 'Please fill in all required contact information.');
        return;
      }
      // Basic email validation
      if (!contactInfo.email.includes('@')) {
        setError(language === 'vi' ? 'Email không hợp lệ.' : 'Invalid email.');
        return;
      }
    } else if (currentBlock.required && !answers[currentBlock.id]) {
      setError(language === 'vi' ? 'Vui lòng hoàn thành câu hỏi này trước khi tiếp tục.' : 'Please complete this question before continuing.');
      return;
    }
    
    setError(null);

    // Check for encouragement message
    const encouragement = activeForm.encouragement_messages?.find(m => m.after_block_index === currentBlockIndex);
    if (encouragement) {
      setActiveEncouragement(encouragement);
      setShowEncouragement(true);
      return;
    }

    if (!isLast) {
      setCurrentBlockIndex(prev => prev + 1);
    }
  };

  const handleContinueAfterEncouragement = () => {
    setShowEncouragement(false);
    if (!isLast) {
      setCurrentBlockIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (!isFirst) {
      setCurrentBlockIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (currentBlock.required && !answers[currentBlock.id]) {
      setError(language === 'vi' ? 'Vui lòng hoàn thành câu hỏi này.' : 'Please complete this question.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Tính toán điểm số
      let totalScore = 0;
      Object.entries(answers).forEach(([blockId, value]) => {
        const block = blocks.find(b => b.id === blockId);
        if (!block || !block.score_enabled) return;

        if (block.type === 'single_choice' || block.type === 'likert') {
          const option = block.options?.find(opt => opt.id === value);
          if (option) totalScore += option.score || 0;
        } else if (block.type === 'multi_choice' && Array.isArray(value)) {
          value.forEach(optId => {
            const option = block.options?.find(opt => opt.id === optId);
            if (option) totalScore += option.score || 0;
          });
        } else if (block.type === 'matrix' && typeof value === 'object') {
          Object.values(value).forEach(colId => {
            const column = block.columns?.find(col => col.id === colId);
            if (column) totalScore += column.score || 0;
          });
        }
      });

      // 2. Chuẩn bị dữ liệu để gửi lên GAS
      const submissionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
      
      // Chuẩn bị kết quả để gửi email (nếu cần)
      const resultMessage = totalScore >= 80 ? 'Tốt' : totalScore >= 50 ? 'Trung bình' : 'Cần chú ý';
      
      const payload = {
        action: 'submit_data',
        form_id: formId,
        form_code: activeForm.code,
        sheet_name: activeForm.code,
        email: contactInfo.email, // Truyền email ra ngoài payload để GAS dễ lấy
        send_email: settings.send_result_email, // Cờ yêu cầu gửi email tự động
        data: {
          submission_id: submissionId,
          timestamp: new Date().toISOString(),
          user_name: contactInfo.name,
          user_email: contactInfo.email,
          user_phone: contactInfo.phone,
          user_org: contactInfo.organization,
          // Map answers based on block codes
          ...Object.entries(answers).reduce((acc, [blockId, value]) => {
            const block = blocks.find(b => b.id === blockId);
            if (!block) return acc;

            if (block.type === 'matrix' && typeof value === 'object') {
              Object.entries(value).forEach(([rowCode, colValue]) => {
                acc[`${block.code}_${rowCode}`] = colValue;
              });
            } else {
              acc[block.code] = value;
            }
            return acc;
          }, {} as Record<string, any>),
          total_score: totalScore,
          form_title: activeForm.title, // Thêm title để GAS gửi email
          result_message: resultMessage // Thêm message để GAS gửi email
        }
      };

      // 3. Gửi dữ liệu lên GAS
      if (settings.GAS_WEB_APP_URL && !settings.GAS_WEB_APP_URL.includes('AKfycb...TODO')) {
        await fetch(settings.GAS_WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      }
      
      // Redirect to results with full data in state
      const resultsData = {
        totalScore,
        maxScore: blocks.reduce((acc, b) => acc + (b.max_score || 0), 0) || 100,
        message: resultMessage,
        chartData: [], // We could calculate this based on subscales
        details: [],
        reward: activeForm.reward
      };
      navigate(`/r/${submissionId}`, { state: { totalScore, results: resultsData } });
    } catch (err) {
      console.error('Submit error:', err);
      setError(language === 'vi' ? 'Có lỗi xảy ra khi gửi dữ liệu. Vui lòng thử lại.' : 'An error occurred while sending data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentBlock.id]: value }));
    setError(null);
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      isEmbed ? "bg-transparent" : "bg-gray-50 dark:bg-gray-950"
    )}>
      {/* Header */}
      {!isEmbed && (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 md:px-8 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                <img src={settings.LOGO_URL} alt="Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
              </div>
              <h1 className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {activeForm.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeLanguageToggle />
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {isContactStep ? t.common.required : `${currentBlockIndex + 1} / ${blocks.length}`}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-800">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentBlockIndex + 2) / (blocks.length + 1)) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {showEncouragement ? (
              <motion.div
                key="encouragement"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-blue-100 dark:border-blue-900/30 p-8 sm:p-12 text-center space-y-6 overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    {activeEncouragement?.type === 'success' ? <Trophy size={40} /> : 
                     activeEncouragement?.type === 'motivation' ? <Sparkles size={40} /> : <Heart size={40} />}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeEncouragement?.type === 'success' ? (language === 'vi' ? 'Làm tốt lắm!' : 'Well done!') : 
                     activeEncouragement?.type === 'motivation' ? (language === 'vi' ? 'Cố gắng lên!' : 'Keep it up!') : (language === 'vi' ? 'Bạn thật tuyệt!' : 'You are amazing!')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-4 leading-relaxed">
                    {activeEncouragement?.message}
                  </p>
                  <button
                    onClick={handleContinueAfterEncouragement}
                    className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                  >
                    {t.common.next}
                  </button>
                </div>
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"
                  />
                </div>
              </motion.div>
            ) : isContactStep ? (
              <motion.div
                key="contact-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-10"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {t.runner.contactInfo}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{t.runner.contactSubtitle}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.name} <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={contactInfo.name}
                        onChange={e => setContactInfo({...contactInfo, name: e.target.value})}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.email} <span className="text-red-500">*</span></label>
                        <input 
                          type="email" 
                          value={contactInfo.email}
                          onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.phone} <span className="text-red-500">*</span></label>
                        <input 
                          type="tel" 
                          value={contactInfo.phone}
                          onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all"
                          placeholder="0901234567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'vi' ? 'Đơn vị công tác / Trường học' : 'Organization / School'}</label>
                      <input 
                        type="text" 
                        value={contactInfo.organization}
                        onChange={e => setContactInfo({...contactInfo, organization: e.target.value})}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all"
                        placeholder={language === 'vi' ? 'Tên đơn vị...' : 'Organization name...'}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm font-medium">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                      {t.runner.startSurvey} <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentBlock.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-10"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {currentBlock.title}
                      {currentBlock.required && <span className="text-red-500 ml-1">*</span>}
                    </h2>
                    {currentBlock.description && (
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{currentBlock.description}</p>
                    )}
                  </div>

                  {/* Input Fields based on type */}
                  <div className="mt-8">
                    {currentBlock.type === 'content' && (
                      <div className="prose prose-blue dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-400">
                          {language === 'vi' ? 'Bấm "Tiếp tục" để chuyển sang câu hỏi tiếp theo.' : 'Click "Next" to move to the next question.'}
                        </p>
                      </div>
                    )}

                    {currentBlock.type === 'single_choice' && (
                      <div className="space-y-3">
                        {currentBlock.options?.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => updateAnswer(opt.id)}
                            className={cn(
                              "w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between group",
                              answers[currentBlock.id] === opt.id
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-100 dark:ring-blue-900/10"
                                : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950"
                            )}
                          >
                            <span className={cn(
                              "font-medium",
                              answers[currentBlock.id] === opt.id ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                            )}>
                              {opt.label}
                            </span>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              answers[currentBlock.id] === opt.id
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600"
                            )}>
                              {answers[currentBlock.id] === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentBlock.type === 'text' && (
                      <textarea
                        value={answers[currentBlock.id] || ''}
                        onChange={(e) => updateAnswer(e.target.value)}
                        placeholder={currentBlock.placeholder || (language === 'vi' ? "Nhập câu trả lời của bạn..." : "Type your answer...")}
                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all min-h-[150px] text-lg"
                      />
                    )}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm font-medium"
                    >
                      <AlertCircle size={18} />
                      {error}
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft size={20} /> {t.common.previous}
                    </button>

                    {!isLast ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                      >
                        {t.common.next} <ChevronRight size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>{t.common.loading}</>
                        ) : (
                          <>{t.common.finish} <Send size={20} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      {!isEmbed && (
        <footer className="py-6 text-center text-gray-400 text-xs">
          <p>Cung cấp bởi PSYEDU RESEARCH &copy; 2024</p>
        </footer>
      )}
    </div>
  );
}

