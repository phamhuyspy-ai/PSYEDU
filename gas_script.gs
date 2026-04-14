/**
 * GOOGLE APPS SCRIPT - PSYEDU RESEARCH SYSTEM (AUTO-SETUP VERSION)
 * Chức năng: Tự động tạo Folder Drive, Sheet, Quản lý mật khẩu, Lưu dữ liệu, Gửi Email
 */

const DEFAULT_ADMIN = {
  email: "phamhuyspy@gmail.com",
  password: "admin123",
  role: "super_admin",
  name: "Super Admin"
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); 

  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    // Tự động tạo hoặc lấy Folder gốc của hệ thống
    const rootFolder = getOrCreateRootFolder();

    switch (action) {
      case 'sync_schema':
        return handleSyncSchema(rootFolder, requestData);
      case 'submit_data':
        return handleSubmitData(rootFolder, requestData);
      case 'update_password':
        return handleUpdatePassword(rootFolder, requestData);
      case 'reset_password':
        return handleResetPassword(rootFolder, requestData);
      default:
        return createResponse("Error", "Action not found");
    }
  } catch (error) {
    return createResponse("Error", error.toString());
  } finally {
    lock.releaseLock();
  }
}

// --- HỆ THỐNG TỰ ĐỘNG ---

function getOrCreateRootFolder() {
  const folderName = "PSYEDU_RESEARCH_DATA";
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getOrCreateSheet(rootFolder, sheetName) {
  const files = rootFolder.getFilesByName(sheetName);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create(sheetName);
  const file = DriveApp.getFileById(ss.getId());
  file.moveTo(rootFolder);
  return ss;
}

// --- CÁC HÀM XỬ LÝ ---

function handleSyncSchema(rootFolder, payload) {
  const sheetName = payload.plan.sheet_name;
  const columns = payload.plan.columns;
  
  const ss = getOrCreateSheet(rootFolder, sheetName);
  const sheet = ss.getSheets()[0];
  
  const currentHeaders = sheet.getLastColumn() > 0 
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] 
    : [];
  
  columns.forEach(colName => {
    if (currentHeaders.indexOf(colName) === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(colName)
           .setBackground("#f3f4f6").setFontWeight("bold");
    }
  });
  
  return createResponse("Success", "Schema synced: " + ss.getUrl());
}

function handleSubmitData(rootFolder, payload) {
  const data = payload.data;
  
  // Xử lý gửi email riêng
  if (data.type === 'email_result') {
    sendResultEmail(payload.email, data.form_title, data.total_score, data.result_message);
    return createResponse("Success", "Email sent");
  }

  const ss = getOrCreateSheet(rootFolder, payload.sheet_name);
  const sheet = ss.getSheets()[0];
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = new Array(headers.length).fill("");
  
  Object.keys(data).forEach(key => {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      newRow[colIndex] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
    }
  });
  
  sheet.appendRow(newRow);
  
  if (payload.send_email && payload.email) {
    sendResultEmail(payload.email, data.form_title, data.total_score, data.result_message);
  }
  
  return createResponse("Success", "Data submitted");
}

function handleUpdatePassword(rootFolder, payload) {
  const ss = getOrCreateSheet(rootFolder, "Users_System");
  let sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Email", "Password", "Role", "Name", "LastUpdate"]);
    sheet.appendRow([DEFAULT_ADMIN.email, DEFAULT_ADMIN.password, DEFAULT_ADMIN.role, DEFAULT_ADMIN.name, new Date()]);
  }
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.email) {
      sheet.getRange(i + 1, 2).setValue(payload.new_password);
      found = true; break;
    }
  }
  if (!found) sheet.appendRow([payload.email, payload.new_password, "manager", "New User", new Date()]);
  return createResponse("Success", "Password updated");
}

function handleResetPassword(rootFolder, payload) {
  const newPassword = Math.random().toString(36).slice(-8);
  handleUpdatePassword(rootFolder, { email: payload.email, new_password: newPassword });
  MailApp.sendEmail(payload.email, "[PSYEDU] Mật khẩu mới", `Mật khẩu mới của bạn là: ${newPassword}`);
  return createResponse("Success", "Reset email sent");
}

function sendResultEmail(email, formTitle, score, message) {
  if (!email) return;
  MailApp.sendEmail({
    to: email,
    subject: `Kết quả: ${formTitle}`,
    htmlBody: `<div style="font-family:sans-serif;"><h2>Kết quả khảo sát</h2><p>Tổng điểm: <b>${score}</b></p><p>Đánh giá: ${message}</p></div>`
  });
}

function createResponse(status, message) {
  return ContentService.createTextOutput(JSON.stringify({ status, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
