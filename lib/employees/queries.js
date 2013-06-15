module.exports = queries = {

  'selectById'              : 'SELECT * FROM employees WHERE employee_id=? AND deleted=0 LIMIT 1',
  'selectEmployees'         : 'SELECT employee_id as id, first_name, last_name, username, email FROM employees WHERE employer_id=? AND deleted=0', 

  //'selectSchedules'         : 'SELECT * FROM schedules WHERE employer_id=? AND awaitingupload = false AND published = true',

  'insert'                  : 'INSERT INTO employees (email, username, password, salt, first_name, last_name, employer_id, reg_time) VALUES (?,?,?,?,?,?,?,NOW())',

  'update'                  : '',

  'updateEmployeeLogin'     : 'UPDATE employees SET login_count=login_count+1, last_login=NOW() WHERE employee_id=?',

  'changeEmployeePassword'  : 'UPDATE employees SET password=? WHERE employee_id=? AND password=? LIMIT 1',

  'selectShiftsFuture'      : 'SELECT shift_id FROM shifts JOIN schedules USING (schedule_id) WHERE employee_id=? AND date>=NOW() AND awaitingupload = false',

  'deactivateEmployee'      : 'UPDATE employees SET active=0 WHERE employee_id=?',
  'delete'                  : 'UPDATE employees SET deleted=1 WHERE employee_id=?'
  
}
