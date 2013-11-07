
require(__basedir+'/helpers/logger').info('Loading queries helpers...');

module.exports = queries = {

  'selectEmployer'          : 'SELECT * FROM employers WHERE employer_id=? LIMIT 1',
  'insertEmployer'          : 'INSERT INTO employers (name, email, username, password, salt, contact_email, contact_phone, contact_address, reg_time) VALUES (?,?,?,?,?,?,?,?,NOW())',
  'updateEmployerLogin'     : 'UPDATE employers SET login_count=login_count+1, last_login=NOW() WHERE employer_id=?',
  'changeEmployerPassword'  : 'UPDATE employers SET password=? WHERE employer_id=? AND password=? LIMIT 1',



  'trackRequest'            : 'INSERT INTO track_requests (user_type, id, method, url, time, ip) VALUES (?,?,?,?,?,?)',
  'trackLogin'              : 'INSERT INTO track_logins (user_type, id, time, ip, statusCode) VALUES (?,?,?,?,?)',



  'insertShift'             : 'INSERT INTO shifts (schedule_id, start, end, position_id, employee_id, creation_time) VALUES (?,?,?,?,?,NOW())',
  'updateShift'             : 'UPDATE shifts SET employee_id=?, start_time=?, end_time=? WHERE shift_id=?',
  'getShiftsBySchedule'     : 'SELECT s.shift_id as id, s.start, s.end, s.position_id, s.employee_id, p.position, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM shifts as s JOIN positions as p USING (position_id) JOIN employees as e USING (employee_id) WHERE schedule_id = ?',

};
