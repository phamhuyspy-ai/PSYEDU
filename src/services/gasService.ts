import { FormMeta, Block } from '../store/builderStore';
import { SystemSettings } from '../store/settingsStore';

interface GasSyncPayload {
  action: 'sync_schema' | 'submit_data' | 'update_password' | 'reset_password';
  form_id?: string;
  form_code?: string;
  email?: string;
  new_password?: string;
  plan?: {
    sheet_name: string;
    columns: string[];
  };
  data?: any;
  timestamp: string;
}

export async function sendEmailResult(
  email: string, 
  submissionId: string, 
  formTitle: string,
  results: any,
  settings: SystemSettings
) {
  if (!settings.GAS_WEB_APP_URL || settings.GAS_WEB_APP_URL.includes('AKfycb...')) {
    return { success: false, message: 'GAS URL not configured' };
  }

  const payload: GasSyncPayload = {
    action: 'submit_data', // We can reuse submit_data or create a specific one
    email,
    data: {
      type: 'email_result',
      submission_id: submissionId,
      form_title: formTitle,
      results: results
    },
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(settings.GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateAdminPassword(email: string, newPassword: string, settings: SystemSettings) {
  if (!settings.GAS_WEB_APP_URL || settings.GAS_WEB_APP_URL.includes('AKfycb...')) {
    return { success: false, message: 'GAS URL not configured' };
  }

  const payload: GasSyncPayload = {
    action: 'update_password',
    email,
    new_password: newPassword,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(settings.GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function resetAdminPassword(email: string, settings: SystemSettings) {
  if (!settings.GAS_WEB_APP_URL || settings.GAS_WEB_APP_URL.includes('AKfycb...')) {
    return { success: false, message: 'GAS URL not configured' };
  }

  const payload: GasSyncPayload = {
    action: 'reset_password',
    email,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(settings.GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function syncFormSchemaWithGas(
  form: FormMeta, 
  blocks: Block[], 
  settings: SystemSettings
) {
  if (!settings.GAS_WEB_APP_URL || settings.GAS_WEB_APP_URL.includes('AKfycb...')) {
    console.warn('GAS_WEB_APP_URL chưa được cấu hình chính xác.');
    return { success: false, message: 'GAS URL not configured' };
  }

  // 1. Tạo danh sách cột (PLAN)
  const columns = [
    'submission_id',
    'timestamp',
    'user_name',
    'user_email',
    'user_phone',
    'user_org',
  ];

  // Thêm các cột dựa trên blocks
  blocks.forEach(block => {
    if (block.type === 'content') return; // Bỏ qua block nội dung

    if (block.type === 'matrix') {
      // Đối với ma trận: blockCode_rowCode
      block.rows?.forEach(row => {
        columns.push(`${block.code}_${row.code}`);
      });
    } else {
      // Các loại khác dùng mã câu hỏi trực tiếp
      columns.push(block.code);
    }
  });

  // Thêm cột tổng điểm nếu có tính điểm
  if (form.show_results) {
    columns.push('total_score');
    columns.push('result_interpretation');
  }

  const payload: GasSyncPayload = {
    action: 'sync_schema',
    form_id: form.id,
    form_code: form.code,
    plan: {
      sheet_name: form.code, // Dùng mã bảng hỏi làm tên Sheet
      columns: columns
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Sử dụng mode no-cors nếu gặp vấn đề CORS với GAS, 
    // nhưng khuyến khích GAS trả về header cho phép CORS.
    const response = await fetch(settings.GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // GAS thường yêu cầu no-cors nếu không cấu hình Options
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    // Vì mode no-cors không trả về body, chúng ta giả định thành công nếu không có lỗi ném ra
    return { success: true, message: 'Schema sync request sent' };
  } catch (error) {
    console.error('Lỗi đồng bộ GAS:', error);
    return { success: false, error };
  }
}
