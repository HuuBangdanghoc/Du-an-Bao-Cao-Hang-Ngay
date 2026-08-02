/**
 * ============================================================
 *  BACKEND GOOGLE APPS SCRIPT — Bảng Điều Khiển Ngày
 *  Đồng bộ: Lịch trình (Schedule), Thu/Chi (Transactions),
 *  trạng thái hoàn thành mục tiêu Deep Work (Goals)
 * ============================================================
 *  Cách dùng: xem file HUONG_DAN_CAU_HINH.md đi kèm.
 * ============================================================
 */

const SHEET_TX = 'Transactions';
const SHEET_GOALS = 'Goals';
const SHEET_SCHEDULE = 'Schedule';

const DAY_KEYS = ['T2','T3','T4','T5','T6','T7','CN'];
const CATEGORIES = ['hoc','xe','deepwork'];

/* ---------- ĐIỂM VÀO: GET ---------- */
// <URL>?date=2026-08-02        -> giao dịch + trạng thái mục tiêu của 1 ngày
// <URL>?action=schedule        -> toàn bộ lịch trình cố định theo thứ trong tuần
function doGet(e) {
  try {
    if (e.parameter.action === 'schedule') {
      return jsonOutput({ schedule: getScheduleGrouped() });
    }

    const date = e.parameter.date;
    if (!date) return jsonOutput({ error: 'Thiếu tham số date (yyyy-mm-dd) hoặc action=schedule' });

    return jsonOutput({
      date: date,
      transactions: getTransactionsByDate(date),
      goals: getGoalsByDate(date),
      stats: getFinanceStats(date) // Gửi thêm thống kê Tuần/Tháng
    });
  } catch (err) {
    return jsonOutput({ error: String(err) });
  }
}

/* ---------- ĐIỂM VÀO: POST ---------- */
// { action:'addTransaction', id, type:'thu'|'chi', amount, note, date }
// { action:'deleteTransaction', id, date }
// { action:'setGoal', date, goalId, completed }
// { action:'addScheduleItem', id, weekday, category, time, desc }
// { action:'deleteScheduleItem', id }
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'addTransaction') addTransaction(body);
    else if (action === 'deleteTransaction') deleteTransaction(body);
    else if (action === 'setGoal') setGoal(body);
    else if (action === 'addScheduleItem') addScheduleItem(body);
    else if (action === 'deleteScheduleItem') deleteScheduleItem(body);
    else return jsonOutput({ status: 'error', message: 'Action không hợp lệ: ' + action });

    return jsonOutput({ status: 'success' });
  } catch (err) {
    return jsonOutput({ status: 'error', message: String(err) });
  }
}

/* ---------- SHEET HELPERS ---------- */
function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
function txSheet_()      { return getSheet_(SHEET_TX,       ['ID','Date','Type','Amount','Note','Timestamp']); }
function goalsSheet_()   { return getSheet_(SHEET_GOALS,    ['Date','GoalID','Completed','Timestamp']); }
function scheduleSheet_(){ return getSheet_(SHEET_SCHEDULE, ['ID','Weekday','Category','Time','Desc','Timestamp']); }

/* ---------- TRANSACTIONS ---------- */
function addTransaction(body) {
  txSheet_().appendRow([
    body.id || ('tx_' + Date.now()),
    "'" + body.date, // Ép thành văn bản thuần
    body.type, 
    Number(body.amount) || 0, 
    body.note || '', 
    new Date()
  ]);
}
function deleteTransaction(body) {
  const sheet = txSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === body.id) { sheet.deleteRow(i + 1); break; }
  }
}
function getTransactionsByDate(date) {
  const data = txSheet_().getDataRange().getValues();
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (formatDate_(row[1]) === date) {
      result.push({ id: row[0], date: formatDate_(row[1]), type: row[2], amount: row[3], note: row[4] });
    }
  }
  return result;
}

/* ---------- GOALS (trạng thái hoàn thành theo ngày) ---------- */
function setGoal(body) {
  const sheet = goalsSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (formatDate_(data[i][0]) === body.date && String(data[i][1]) === String(body.goalId)) {
      sheet.getRange(i + 1, 3).setValue(!!body.completed);
      sheet.getRange(i + 1, 4).setValue(new Date());
      return;
    }
  }
  sheet.appendRow(["'" + body.date, body.goalId, !!body.completed, new Date()]); // Ép thành văn bản thuần
}
function getGoalsByDate(date) {
  const data = goalsSheet_().getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    if (formatDate_(data[i][0]) === date) result[String(data[i][1])] = !!data[i][2];
  }
  return result;
}

/* ---------- SCHEDULE (lịch trình cố định theo thứ trong tuần) ---------- */
function addScheduleItem(body) {
  scheduleSheet_().appendRow([
    body.id || ('it_' + Date.now()),
    "'" + body.date, // Ép thành văn bản thuần
    body.category, 
    body.time || '', 
    body.desc || '', 
    new Date()
  ]);
}
function deleteScheduleItem(body) {
  const sheet = scheduleSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === body.id) { sheet.deleteRow(i + 1); break; }
  }
}
function getScheduleGrouped() {
  const data = scheduleSheet_().getDataRange().getValues();
  const grouped = {};
  DAY_KEYS.forEach(k => { grouped[k] = { hoc: [], xe: [], deepwork: [] }; });

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = row[0], weekday = row[1], category = row[2], time = row[3], desc = row[4];
    if (!grouped[weekday] || CATEGORIES.indexOf(category) === -1) continue;
    grouped[weekday][category].push({ id: id, time: time, desc: desc });
  }
  return grouped;
}

/* ---------- UTIL ---------- */
function formatDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
/* ---------- TÍNH THỐNG KÊ TUẦN / THÁNG ---------- */
function getFinanceStats(targetDateStr) {
  const targetDate = new Date(targetDateStr);
  const targetMonthStr = targetDateStr.substring(0, 7); // yyyy-MM
  
  // Tính 7 ngày trong tuần của ngày đang chọn (Thứ 2 đến CN)
  const day = targetDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(targetDate);
  monday.setDate(targetDate.getDate() + diff);
  
  const weekStrs = [];
  for(let i = 0; i < 7; i++) {
    let d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekStrs.push(formatDate_(d));
  }

  const data = txSheet_().getDataRange().getValues();
  let wThu = 0, wChi = 0, mThu = 0, mChi = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const dateStr = formatDate_(row[1]);
    const type = row[2];
    const amount = Number(row[3]) || 0;

    // Cộng dồn tháng
    if (dateStr.startsWith(targetMonthStr)) {
      if (type === 'thu') mThu += amount; else mChi += amount;
    }
    // Cộng dồn tuần
    if (weekStrs.indexOf(dateStr) !== -1) {
      if (type === 'thu') wThu += amount; else wChi += amount;
    }
  }
  return { week: { thu: wThu, chi: wChi }, month: { thu: mThu, chi: mChi } };
}
