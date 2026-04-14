import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { translations } from '../../lib/translations';
import { resetAdminPassword } from '../../services/gasService';
import { Lock, Mail, AlertCircle, ArrowLeft, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import ThemeLanguageToggle from '../../components/ThemeLanguageToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const { login, isAuthenticated } = useAuthStore();
  const { language, theme } = useAppStore();
  const { settings } = useSettingsStore();
  const t = translations[language];
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (isForgotPassword) {
      setIsLoading(true);
      try {
        await resetAdminPassword(email, settings);
        setSuccess(language === 'vi' ? 'Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn để nhận mật khẩu mới.' : 'Request sent. Please check your email for the new password.');
      } catch (err: any) {
        setError(err.message || (language === 'vi' ? 'Gửi yêu cầu thất bại' : 'Request failed'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // PIN verification
    if (pin !== '010216') {
      setError(language === 'vi' ? 'Mã PIN xác minh admin không chính xác.' : 'Incorrect admin verification PIN.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || (language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-300",
      theme === 'dark' ? "bg-gray-950" : "bg-gray-50"
    )}>
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft size={20} />
          {t.common.back} {t.common.home}
        </Link>
      </div>

      <div className="absolute top-8 right-8">
        <ThemeLanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white uppercase">
          {isForgotPassword ? (language === 'vi' ? 'Quên mật khẩu' : 'Forgot Password') : t.common.admin}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isForgotPassword 
            ? (language === 'vi' ? 'Nhập email để nhận mật khẩu mới' : 'Enter email to receive new password')
            : 'Hệ thống quản trị PSYEDU RESEARCH'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-md">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <p className="ml-3 text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email {t.common.admin}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-2 border bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  placeholder="admin@psyedu.vn"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Mật khẩu' : 'Password'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-2 border bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Mã PIN xác minh (6 chữ số)' : 'Verification PIN (6 digits)'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="pin"
                      name="pin"
                      type="password"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-2 border bg-white dark:bg-gray-950 text-gray-900 dark:text-white tracking-[0.5em] font-bold"
                      placeholder="••••••"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(!isForgotPassword);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {isForgotPassword 
                  ? (language === 'vi' ? 'Quay lại đăng nhập' : 'Back to login')
                  : (language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?')}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <Loader2 className="animate-spin" size={18} />}
                {isForgotPassword 
                  ? (isLoading ? (language === 'vi' ? 'Đang gửi...' : 'Sending...') : (language === 'vi' ? 'Gửi yêu cầu' : 'Send request'))
                  : (isLoading ? (language === 'vi' ? 'Đang xác minh...' : 'Verifying...') : t.common.login)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

