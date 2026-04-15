import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useBuilderStore } from '../../store/builderStore';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../lib/translations';
import { Search, ArrowRight, Info, MapPin, Phone, Mail, Globe, LogIn, Youtube, Facebook, Music2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import ThemeLanguageToggle from '../../components/ThemeLanguageToggle';
import { useSettingsStore } from '../../store/settingsStore';

export default function PublicPortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const { forms, setForms } = useBuilderStore();
  const { language, theme } = useAppStore();
  const { settings } = useSettingsStore();
  const t = translations[language];

  useEffect(() => {
    // Rely on store populated by admin
  }, [forms.length, setForms, language]);

  const activeForms = forms.filter(f => f.publish_status === 'published' && f.collection_status === 'open');
  const assessments = activeForms.filter(f => f.type === 'assessment');
  const surveys = activeForms.filter(f => f.type === 'survey');

  const FormGrid = ({ title, items }: { title: string, items: any[] }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full font-bold">
          {items.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(f => (
          <div 
            key={f.id}
            className="group bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all flex flex-col"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
                  {f.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                {f.description}
              </p>
            </div>
            <button 
              onClick={() => navigate(`/s/${f.id}${isEmbed ? '?embed=true' : ''}`)}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all"
            >
              {t.portal.startNow} <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      isEmbed ? "bg-transparent" : "bg-gray-50 dark:bg-gray-950"
    )}>
      {/* Top Bar */}
      {!isEmbed && (
        <div className="bg-gray-900 dark:bg-black text-white py-2 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <ThemeLanguageToggle />
            <Link 
              to="/admin/login" 
              className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              <LogIn size={14} />
              {t.common.admin}
            </Link>
          </div>
        </div>
      )}

      {/* Header Section */}
      {!isEmbed && (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-12 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-100 dark:shadow-none shrink-0">
              {settings.ORG_NAME.charAt(0)}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{settings.ORG_NAME}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                {t.portal.subtitle} {t.portal.description}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={14} /> {settings.ORG_ADDRESS}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {settings.ORG_PHONE}</span>
                <span className="flex items-center gap-1"><Mail size={14} /> {settings.ORG_EMAIL}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-12">
        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.portal.title}</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t.portal.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {activeForms.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <Info className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">{t.portal.noForms}</p>
            </div>
          ) : (
            <div className="space-y-16">
              {assessments.length > 0 && (
                <FormGrid title={t.portal.assessmentTitle} items={assessments} />
              )}
              
              {surveys.length > 0 && (
                <FormGrid title={t.portal.surveyTitle} items={surveys} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Section */}
      {!isEmbed && (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {settings.APP_NAME.charAt(0)}
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">{settings.APP_NAME}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Nền tảng khảo sát chuyên sâu dành cho lĩnh vực tâm lý và giáo dục. 
                Giúp các nhà nghiên cứu thu thập dữ liệu chính xác và hiệu quả.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white">Liên kết</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {(settings.FOOTER_LINKS || []).map((link, index) => (
                  <li key={index}><a href={link.url} className="hover:text-blue-600">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white">Theo dõi</h4>
              <div className="flex flex-wrap gap-3">
                {settings.ORG_WEBSITE && (
                  <a href={settings.ORG_WEBSITE} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all" title="Website">
                    <Globe size={16} />
                  </a>
                )}
                {settings.SOCIAL_FACEBOOK && (
                  <a href={settings.SOCIAL_FACEBOOK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all" title="Facebook">
                    <Facebook size={16} />
                  </a>
                )}
                {settings.SOCIAL_YOUTUBE && (
                  <a href={settings.SOCIAL_YOUTUBE} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all" title="YouTube">
                    <Youtube size={16} />
                  </a>
                )}
                {settings.SOCIAL_TIKTOK && (
                  <a href={settings.SOCIAL_TIKTOK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all" title="TikTok">
                    <Music2 size={16} />
                  </a>
                )}
                <a href={`mailto:${settings.ORG_EMAIL}`} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all" title="Email">
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto pt-12 mt-12 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
            &copy; 2024 {settings.APP_NAME}. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}
