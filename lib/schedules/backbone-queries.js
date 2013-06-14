module.exports = queries = {

  'selectById'              : 'SELECT schedule_id as id, json, date, type, image_loc AS url, g_spreadsheet_key, timezone FROM schedules WHERE schedule_id=? AND awaitingupload = false AND published = true LIMIT 1',
  'selectSchedulesFuture'   : 'SELECT schedule_id as id, json, date, type, image_loc AS url, g_spreadsheet_key, timezone FROM schedules WHERE employer_id=? AND date>=NOW() AND awaitingupload = false AND published = true',
  'selectScheduleDate'      : 'SELECT schedule_id as id, json, date, type, image_loc AS url, g_spreadsheet_key, timezone FROM schedules WHERE employer_id=? AND date=? AND awaitingupload = false AND published = true LIMIT 1',

  'getShiftsBySchedule'     : 'SELECT s.shift_id as id, s.start, s.end, s.position_id, s.employee_id, p.position, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM shifts as s JOIN positions as p USING (position_id) JOIN employees as e USING (employee_id) WHERE schedule_id = ?',

  'verifyUpload'            : 'UPDATE schedules SET awaitingupload=0, published=1 WHERE schedule_id=?',

  'publishSchedule'         : 'UPDATE schedules SET published=1 WHERE schedule_id=? AND employer_id=?',
  'unpublishSchedule'       : 'UPDATE schedules SET published=0 WHERE schedule_id=? AND employer_id=?',

  'updateTimezone'          : 'UPDATE schedules SET timezone=? WHERE schedule_id=? AND employer_id=?',

  'insert'                  : 'INSERT INTO schedules (employer_id, date, type, image_loc, timezone, json, creation_time, awaitingupload, published) VALUES (?,?,?,?,?,?,NOW(),0,1)',
  'insertWithImage'         : 'INSERT INTO schedules (employer_id, date, type, image_loc, timezone, json, creation_time) VALUES (?,?,?,?,?,?,NOW())'

}
