function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    
    // Add CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    let result = { success: false, message: 'Unknown action' };
    
    switch (action) {
      case 'login_admin':
        result = handleLogin(payload);
        break;
      case 'update_password':
        result = handleUpdatePassword(payload);
        break;
      case 'reset_password':
        result = handleResetPassword(payload);
        break;
      case 'sync_schema':
        result = handleSyncSchema(payload);
        break;
      case 'submit_data':
        result = handleSubmitData(payload);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  // Handle CORS preflight
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Helper to get or create a sheet
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

// 1. Auth Handlers
function handleLogin(payload) {
  const { email, password, pin } = payload;
  
  // In a real app, read from a 'Users' sheet.
  // For this template, we hardcode the initial check but you can expand it.
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let usersSheet = ss.getSheetByName('Users_System');
  
  if (!usersSheet) {
    // Create default users if not exists
    usersSheet = ss.insertSheet('Users_System');
    usersSheet.appendRow(['id', 'email', 'password', 'pin', 'name', 'role']);
    usersSheet.appendRow(['1', 'phamhuyspy@gmail.com', 'admin123', '010216', 'Super Admin', 'super_admin']);
    usersSheet.appendRow(['2', 'manager@psyedu.vn', 'manager123', '010216', 'Manager', 'manager']);
  }
  
  const data = usersSheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const userEmail = row[headers.indexOf('email')];
    const userPass = row[headers.indexOf('password')];
    const userPin = row[headers.indexOf('pin')];
    
    if (userEmail === email && userPass === password && userPin === pin) {
      return {
        success: true,
        user: {
          id: row[headers.indexOf('id')],
          email: userEmail,
          name: row[headers.indexOf('name')],
          role: row[headers.indexOf('role')]
        }
      };
    }
  }
  
  return { success: false, message: 'Email, mật khẩu hoặc mã PIN không đúng' };
}

function handleUpdatePassword(payload) {
  const { email, new_password } = payload;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users_System');
  
  if (!usersSheet) return { success: false, message: 'System not initialized' };
  
  const data = usersSheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('email')] === email) {
      usersSheet.getRange(i + 1, headers.indexOf('password') + 1).setValue(new_password);
      return { success: true, message: 'Cập nhật mật khẩu thành công' };
    }
  }
  
  return { success: false, message: 'Không tìm thấy người dùng' };
}

function handleResetPassword(payload) {
  const { email } = payload;
  // Generate random password
  const newPass = Math.random().toString(36).slice(-8);
  
  const updateResult = handleUpdatePassword({ email, new_password: newPass });
  if (updateResult.success) {
    try {
      MailApp.sendEmail({
        to: email,
        subject: 'Khôi phục mật khẩu PSYEDU',
        htmlBody: \`Mật khẩu mới của bạn là: <strong>\${newPass}</strong><br>Vui lòng đăng nhập và đổi mật khẩu ngay.\`
      });
      return { success: true, message: 'Đã gửi mật khẩu mới qua email' };
    } catch (e) {
      return { success: false, message: 'Lỗi gửi email: ' + e.toString() };
    }
  }
  return updateResult;
}

// 2. Schema Sync
function handleSyncSchema(payload) {
  const { plan } = payload;
  if (!plan || !plan.sheet_name || !plan.columns) {
    return { success: false, message: 'Thiếu thông tin plan' };
  }
  
  const sheet = getOrCreateSheet(plan.sheet_name);
  
  // Get existing headers
  const lastCol = sheet.getLastColumn();
  let existingHeaders = [];
  if (lastCol > 0) {
    existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }
  
  // Merge headers
  const newHeaders = [...existingHeaders];
  let headersAdded = false;
  
  plan.columns.forEach(col => {
    if (!newHeaders.includes(col)) {
      newHeaders.push(col);
      headersAdded = true;
    }
  });
  
  if (headersAdded || lastCol === 0) {
    sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    // Format header
    sheet.getRange(1, 1, 1, newHeaders.length).setFontWeight('bold').setBackground('#f3f4f6');
  }
  
  return { success: true, message: 'Đồng bộ schema thành công' };
}

// 3. Submit Data
function handleSubmitData(payload) {
  const { form_code, data, send_email, email } = payload;
  
  if (data.type === 'email_result') {
    // Just send email
    return sendResultEmail(email, data.form_title, data.results);
  }
  
  if (!form_code || !data) {
    return { success: false, message: 'Thiếu form_code hoặc data' };
  }
  
  const sheet = getOrCreateSheet(form_code);
  const lastCol = sheet.getLastColumn();
  
  if (lastCol === 0) {
    return { success: false, message: 'Schema chưa được đồng bộ' };
  }
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rowData = new Array(headers.length).fill('');
  
  // Map data to columns
  Object.keys(data).forEach(key => {
    const index = headers.indexOf(key);
    if (index !== -1) {
      let value = data[key];
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      rowData[index] = value;
    }
  });
  
  sheet.appendRow(rowData);
  
  // Send email if requested
  if (send_email && email) {
    sendResultEmail(email, data.form_title, {
      totalScore: data.total_score,
      message: data.result_message
    });
  }
  
  return { success: true, message: 'Lưu dữ liệu thành công' };
}

function sendResultEmail(email, formTitle, results) {
  try {
    const htmlBody = \`
      <h2>Kết quả khảo sát: \${formTitle}</h2>
      <p>Cảm ơn bạn đã tham gia khảo sát.</p>
      \${results.totalScore !== undefined ? \`<p><strong>Điểm số của bạn:</strong> \${results.totalScore}</p>\` : ''}
      \${results.message ? \`<p><strong>Đánh giá:</strong> \${results.message}</p>\` : ''}
      <br>
      <p>Trân trọng,</p>
      <p>Viện Tâm lý Giáo dục PSYEDU</p>
    \`;
    
    MailApp.sendEmail({
      to: email,
      subject: \`Kết quả khảo sát: \${formTitle}\`,
      htmlBody: htmlBody
    });
    return { success: true, message: 'Đã gửi email kết quả' };
  } catch (e) {
    return { success: false, message: 'Lưu thành công nhưng lỗi gửi email: ' + e.toString() };
  }
}
