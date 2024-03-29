
module.exports = queries = {

  // Note that this select will only (for now) be used for editing fetching to the backbone model
  'selectById'    : 'SELECT shift_id AS id, schedule_id, start, end, position_id, employee_id FROM shifts WHERE shift_id=?',

  'checkSchedule' : 'SELECT schedule_id FROM schedules WHERE employer_id=? AND schedule_id=?',
  'insert'        : 'INSERT INTO shifts (schedule_id, start, end, employee_id, position_id, creation_time) VALUES (?,?,?,?,?,NOW())',

  'checkOwner'    : 'SELECT shift_id FROM shifts JOIN schedules USING (schedule_id) WHERE employer_id=? AND shift_id=?',
  'deleteById'    : 'DELETE FROM shifts WHERE shift_id=?',

  //'update'        : 'UPDATE shifts SET employee_id=:employee_id, position_id=:position_id, start=:start, end=:end WHERE shift_id=:shift_id'
  'update'        : 'UPDATE shifts SET employee_id=?, position_id=?, start=?, end=? WHERE shift_id=?',

  'checkEmployeeShift' : {
    query : 'SELECT * FROM shifts WHERE employee_id = ? AND schedule_id = ( SELECT schedule_id FROM shifts WHERE shift_id = ? ) AND ( (? >= start AND ? <= end) || (? >= start AND ? <= end) ) AND shift_id != ? LIMIT 1',
    params: function (eid, sid, start, end) {
      return [ eid, sid, start, start, end, end, sid ]
    }
  },

  'getShiftsBySchedulePopulated' : 'SELECT s.shift_id as id, s.schedule_id, s.start, s.end, s.position_id, s.employee_id, p.position, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM shifts as s JOIN positions as p USING (position_id) JOIN users as e ON (employee_id = e.user_id) WHERE schedule_id = ?',

}
