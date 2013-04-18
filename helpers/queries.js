console.log('Loading queries...');

module.exports = queries = {

	'selectEmployee' 			: 'SELECT * FROM employees WHERE employee_id=? LIMIT 1',
	'selectEmployees'			: 'SELECT employee_id, first_name, last_name, username, email FROM employees WHERE employer_id=?',
	'selectSchedules' 			: 'SELECT * FROM schedules WHERE employer_id=? AND awaitingupload = false AND published = true',

	'selectEmployer' 			: 'SELECT * FROM employers WHERE employer_id=? LIMIT 1',

	'changeEmployeePassword'	: 'UPDATE employees SET password=? WHERE employee_id=? AND password=? LIMIT 1',
	'changeEmployerPassword'	: 'UPDATE employers SET password=? WHERE employer_id=? AND password=? LIMIT 1',

	'updateEmployeeLogin'		: 'UPDATE employees SET login_count=login_count+1, last_login=NOW() WHERE employee_id=?',
	'updateEmployerLogin' 		: 'UPDATE employers SET login_count=login_count+1, last_login=NOW() WHERE employer_id=?',

	'verifyUpload' 				: 'UPDATE schedules SET awaitingupload=0, published=1 WHERE schedule_id=?',
	'publishSchedule' 			: 'UPDATE schedules SET published=1 WHERE schedule_id=?',

	'getSchedulesByEmployer'	: 'SELECT schedule_id as id, json, date, type, image_loc AS url, g_spreadsheet_key FROM schedules WHERE employer_id=? AND awaitingupload = false AND published = true',
	'getSchedulesByEmployerFuture'	: 'SELECT schedule_id as id, json, date, type, image_loc AS url, g_spreadsheet_key FROM schedules WHERE employer_id=? AND date>=? AND awaitingupload = false AND published = true',

	'getScheduleByEmployerDate'	: 'SELECT schedule_id as id, json, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND date=? AND awaitingupload = false AND published = true LIMIT 1',


	'trackRequest' 				: 'INSERT INTO track_requests (user_type, id, method, url, time, ip) VALUES (?,?,?,?,?,?)',
	'trackLogin' 				: 'INSERT INTO track_logins (user_type, id, time, ip, statusCode) VALUES (?,?,?,?,?)',


	'insertEmployer'			: 'INSERT INTO employers (name, email, username, password, contact_email, contact_phone, contact_address, reg_time) VALUES (?,?,?,?,?,?,?,NOW())',
	'insertEmployee'			: 'INSERT INTO employees (email, username, password, first_name, last_name, employer_id, reg_time) VALUES (?,?,?,?,?,?,NOW())',


	'insertShift'				: 'INSERT INTO shifts (schedule_id, start, end, position_id, employee_id, creation_time) VALUES (?,?,?,?,?,NOW())',
	'updateShift'				: 'UPDATE shifts SET employee_id=?, start_time=?, end_time=? WHERE shift_id=?',
	'getShiftsBySchedule'		: 'SELECT s.shift_id, s.start, s.end, s.position_id, s.employee_id, p.position, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM shifts as s JOIN positions as p USING (position_id) JOIN employees as e USING (employee_id) WHERE schedule_id = ?',

	'insertPosition'			: 'INSERT INTO positions (employer_id, position, full_name, description) VALUES (?,?,?,?)',
	'selectPositions'			: 'SELECT position_id, position, full_name, description FROM positions WHERE employer_id=?',

	'publishSchedule'			: 'UPDATE schedules SET published=1 WHERE schedule_id=? AND employer_id=?',
	'unpublishSchedule'			: 'UPDATE schedules SET published=0 WHERE schedule_id=? AND employer_id=?'
}
