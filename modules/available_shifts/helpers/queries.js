/*
  Change Request queries
*/
module.exports = queries = {

  'insert'                   : 'INSERT INTO available_shifts (shift_id, notes, employee_id, employer_id, creation_time) VALUES (?,?,?,?,NOW())',

  'selectById'               : 'SELECT available_shift_id as id, shift_id, notes, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM available_shifts WHERE active=1 && available_shift_id=? LIMIT 1',
  'selectRequestsByEmployee' : 'SELECT available_shift_id as id, shift_id, notes, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM available_shifts WHERE active=1 && employee_id=?',
  'selectRequestsByEmployer' : 'SELECT available_shift_id as id, shift_id, notes, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM available_shifts WHERE active=1 && employer_id=?',

  'update'                   : 'UPDATE available_shifts SET notes=? WHERE available_shift_id=? LIMIT 1',

  'destroy'                  : 'UPDATE available_shifts SET active=0 WHERE available_shift_id=? LIMIT 1'

}
