import { FormMeta, Block } from '../store/builderStore';
import { SystemSettings } from '../store/settingsStore';

interface GasSyncPayload {
  action: 'sync_schema' | 'submit_data' | 'update_password' | 'reset_password' | 'login_admin';
  form_id?: string;
  form_code?: string;
  email?: string;
  password?: string;
  pin?: string;
  new_password?: string;
  plan?: {
    sheet_name: string;
    columns: string[];
  };
  data?: any;
  timestamp: string;
}

export async function gasRequest(payload: GasSyncPayload, settings: SystemSettings) {
  if (!settings.GAS_WEB_APP_URL || settings.GAS_WEB_APP_URL.includes('AKfycb...')) {
    throw new Error('GAS URL chưa được cấu hình.');
  }

  try {
    const response = await fetch(settings.GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Lỗi từ máy chủ GAS');
    }
    return result;
  } catch (error: any) {
    console.error('GAS Request Error:', error);
    throw new Error(error.message || 'Không thể kết nối đến máy chủ GAS');
  }
}

export async function loginAdminGas(email: string, password: string, pin: string, settings: SystemSettings) {
  const payload: GasSyncPayload = {
    action: 'login_admin',
    email,
    password,
    pin,
    timestamp: new Date().toISOString()
  };
  return await gasRequest(payload, settings);
}

export async function sendEmailResult(
  email: string, 
  submissionId: string, 
  formTitle: string,
  results: any,
  settings: SystemSettings
) {
  const payload: GasSyncPayload = {
    action: 'submit_data',
    email,
    data: {
      type: 'email_result',
      submission_id: submissionId,
      form_title: formTitle,
      results: results
    },
    timestamp: new Date().toISOString()
  };
  return await gasRequest(payload, settings);
}

export async function updateAdminPassword(email: string, newPassword: string, settings: SystemSettings) {
  const payload: GasSyncPayload = {
    action: 'update_password',
    email,
    new_password: newPassword,
    timestamp: new Date().toISOString()
  };
  return await gasRequest(payload, settings);
}

export async function resetAdminPassword(email: string, settings: SystemSettings) {
  const payload: GasSyncPayload = {
    action: 'reset_password',
    email,
    timestamp: new Date().toISOString()
  };
  return await gasRequest(payload, settings);
}

export async function syncFormSchemaWithGas(
  form: FormMeta, 
  blocks: Block[], 
  settings: SystemSettings
) {
  const columns = [
    'submission_id',
    'timestamp',
    'user_name',
    'user_email',
    'user_phone',
    'user_org',
  ];

  blocks.forEach(block => {
    if (block.type === 'content') return;
    if (block.type === 'matrix') {
      block.rows?.forEach(row => {
        columns.push(`${block.code}_${row.code}`);
      });
    } else {
      columns.push(block.code);
    }
  });

  if (form.show_results) {
    columns.push('total_score');
    columns.push('result_interpretation');
  }

  const payload: GasSyncPayload = {
    action: 'sync_schema',
    form_id: form.id,
    form_code: form.code,
    plan: {
      sheet_name: form.code,
      columns: columns
    },
    timestamp: new Date().toISOString()
  };

  return await gasRequest(payload, settings);
}
