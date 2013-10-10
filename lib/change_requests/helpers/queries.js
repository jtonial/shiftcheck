/*
  Change Request queries
*/
module.exports = queries = {

  'insert'                   : 'INSERT INTO requests (available_shift_id, from_employee, to_employee, notes, creation_time) VALUES (?,?,?,?,NOW())',

  'selectById'               : 'SELECT request_id as id, available_shift_id, from_employee, to_employee, state, response_by, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM requests WHERE request_id=? LIMIT 1',
  'selectRequestsByEmployee' : 'SELECT request_id as id, available_shift_id, from_employee, to_employee, state, response_by, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM requests WHERE from_employee=? OR to_employee=?',
  'selectRequestsByEmployer' : 'SELECT request_id as id, available_shift_id, from_employee, to_employee, state, response_by, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM requests WHERE request_id=?',

  'selectRequestsByAvailableShift' : 'SELECT request_id as id, available_shift_id, from_employee, to_employee, state, response_by, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM requests WHERE available_shift_id=?',

  'update'                   : 'UPDATE requests SET state=?, response_by=?, response_time=?, notes=? WHERE request_id=? LIMIT 1',

  'deactivate'               : 'UPDATE requests SET active=0 WHERE request_id=?'

}
