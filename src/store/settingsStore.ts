import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemSettings {
  // App & Org Info
  APP_NAME: string;
  ORG_NAME: string;
  ORG_ADDRESS: string;
  ORG_EMAIL: string;
  ORG_PHONE: string;
  ORG_WEBSITE: string;
  
  // Social Links
  SOCIAL_YOUTUBE: string;
  SOCIAL_FACEBOOK: string;
  SOCIAL_TIKTOK: string;
  
  // Apps Script bridge
  GAS_WEB_APP_URL: string;
  GOOGLE_SHEET_ID: string;
  DRIVE_FOLDER_ID: string;
  
  // Navigation
  APP_URL: string;
  HOME_URL: string;
  ADMIN_URL: string;
  SURVEY_BASE_URL: string;
  RESULT_BASE_URL: string;
  
  // Public runtime
  show_result_after_submit: boolean;
  send_result_email: boolean;
  require_profile_by_default: boolean;
  require_consent_by_default: boolean;
  
  // CTA settings
  default_cta_type: 'booking' | 'link' | 'none';
  default_cta_label: string;
  default_cta_url: string;
  SUNNYCARE_BOOKING_URL: string;
  enable_cta_in_result: boolean;
  enable_cta_in_pdf: boolean;
  enable_cta_in_email: boolean;

  // AI Bot Settings
  AI_ENABLED: boolean;
  AI_PROVIDER: 'gemini' | 'openai' | 'none';
  AI_API_KEY: string;
  AI_MODEL: string;
  AI_EXPERT_NAME: string;
  AI_SYSTEM_PROMPT: string;
  AI_KNOWLEDGE_BASE: string;
  FOOTER_LINKS: { label: string, url: string }[];
}

interface SettingsState {
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  APP_NAME: 'PSYEDU RESEARCH',
  ORG_NAME: 'Viện Tâm lý Giáo dục PSYEDU',
  ORG_ADDRESS: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
  ORG_EMAIL: 'contact@psyedu.vn',
  ORG_PHONE: '024 123 4567',
  ORG_WEBSITE: 'https://psyedu.vn',
  
  SOCIAL_YOUTUBE: '',
  SOCIAL_FACEBOOK: '',
  SOCIAL_TIKTOK: '',
  
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxAifc1lwuyovelULQ5t9nkUxKojPbUTtzJ78wtlfFJWhBUjHimW4xSHVb0tvWa88ITBQ/exec',
  GOOGLE_SHEET_ID: '1Jx6tf1eYRjJKImHFMeLOXUjHR7S8EVeU4uICNgHu0kLjHAuZ8KgnREUa',
  DRIVE_FOLDER_ID: '1A_...',
  
  APP_URL: 'https://psyedu.vn',
  HOME_URL: 'https://psyedu.vn',
  ADMIN_URL: 'https://psyedu.vn/admin',
  SURVEY_BASE_URL: 'https://psyedu.vn/s',
  RESULT_BASE_URL: 'https://psyedu.vn/r',
  
  show_result_after_submit: true,
  send_result_email: true,
  require_profile_by_default: false,
  require_consent_by_default: true,
  
  default_cta_type: 'booking',
  default_cta_label: 'Đặt lịch tư vấn ngay',
  default_cta_url: 'https://sunnycare.vn/dat-lich',
  SUNNYCARE_BOOKING_URL: 'https://sunnycare.vn/dat-lich',
  enable_cta_in_result: true,
  enable_cta_in_pdf: true,
  enable_cta_in_email: true,

  AI_ENABLED: true,
  AI_PROVIDER: 'gemini',
  AI_API_KEY: '',
  AI_MODEL: 'gemini-3-flash-preview',
  AI_EXPERT_NAME: 'Chuyên gia Psyedu',
  AI_SYSTEM_PROMPT: 'Bạn là một chuyên gia tâm lý học giáo dục hàng đầu từ Viện Tâm lý Giáo dục PSYEDU. Nhiệm vụ của bạn là lắng nghe, thấu hiểu và đưa ra những lời khuyên chuyên môn, trấn an và định hướng cho người dùng dựa trên kết quả khảo sát của họ hoặc các vấn đề họ đang gặp phải. Hãy luôn giữ thái độ chuyên nghiệp, ấm áp và đồng cảm.',
  AI_KNOWLEDGE_BASE: '',
  FOOTER_LINKS: [
    { label: 'Về chúng tôi', url: '#' },
    { label: 'Chính sách bảo mật', url: '#' },
    { label: 'Điều khoản sử dụng', url: '#' }
  ],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),
    }),
    {
      name: 'psyedu-system-settings',
    }
  )
);
