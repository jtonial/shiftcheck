
module.exports = queries = {

  'checkSchedule' : 'SELECT schedule_id FROM schedules WHERE employer_id=? AND schedule_id=?',
  'insert'        : 'INSERT INTO shifts (schedule_id, start, end, employee_id, position_id, creation_time) VALUES (?,?,?,?,?,NOW())',

  'checkOwner'    : 'SELECT shift_id FROM shifts JOIN schedules USING (schedule_id) WHERE employer_id=? AND shift_id=?',
  'delete'        : 'DELETE FROM shifts WHERE shift_id=?',

  //'update'        : 'UPDATE shifts SET employee_id=:employee_id, position_id=:position_id, start=:start, end=:end WHERE shift_id=:shift_id'
  'update'        : 'UPDATE shifts SET employee_id=?, position_id=?, start=?, end=? WHERE shift_id=?'
}
