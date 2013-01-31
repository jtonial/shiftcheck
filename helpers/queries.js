console.log('Loading queries...');

module.exports = queries = {

	'selectEmployee' 			: 'SELECT * FROM employees WHERE employee_id=? LIMIT 1',
	'selectSchedules' 			: 'SELECT * FROM schedules WHERE employer_id=? AND awaitingupload = false',

	'selectEmployer' 			: 'SELECT * FROM employers WHERE employer_id=? LIMIT 1',

	'changeEmployeePassword'	: 'UPDATE employees SET password=? WHERE employee_id=? AND password=? LIMIT 1',
	'changeEmployerPassword'	: 'UPDATE employers SET password=? WHERE employer_id=? AND password=? LIMIT 1',

	'updateEmployeeLogin'		: 'UPDATE employees SET login_count=login_count+1, last_login=NOW() WHERE employee_id=?',
	'updateEmployerLogin' 		: 'UPDATE employers SET login_count=login_count+1, last_login=NOW() WHERE employer_id=?',

	'verifyUpload' 				: 'UPDATE schedules SET awaitingupload=0 WHERE schedule_id=?',

	'getSchedulesByEmployer'	: 'SELECT schedule_id, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND awaitingupload = false',
	'getSchedulesByEmployerFuture'	: 'SELECT schedule_id, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND date>=CURDATE() AND awaitingupload = false',

	'getScheduleByEmployerDate'	: 'SELECT schedule_id, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND date=? AND awaitingupload = false LIMIT 1',


	'trackRequest' 				: 'INSERT INTO track_requests (user_type, id, method, url, time, ip) VALUES (?,?,?,?,?,?)',
	'trackLogin' 				: 'INSERT INTO track_logins (user_type, id, time, ip, statusCode) VALUES (?,?,?,?,?)'

}
