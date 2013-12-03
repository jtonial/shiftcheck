module.exports = queries = {

  'selectById'              : 'SELECT * FROM users WHERE user_id=? AND deleted=0 LIMIT 1',
  'selectEmployees'         : 'SELECT user_id as id, first_name, last_name, username, email, admin FROM users WHERE employer_id=? AND deleted=0', 


  'selectShiftsFuture'      : 'SELECT shift_id FROM shifts JOIN schedules USING (schedule_id) WHERE employee_id=? AND date>=NOW() AND awaitingupload = false',

  'deactivateEmployee'      : 'UPDATE employees SET active=0 WHERE employee_id=?',
  'delete'                  : 'UPDATE employees SET deleted=1 WHERE employee_id=?'
  
}
