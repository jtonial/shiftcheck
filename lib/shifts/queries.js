
module.exports = queries = {
  'checkSchedule' : 'SELECT schedule_id FROM schedules WHERE employer_id=? AND schedule_id=?',
  'insert'        : 'INSERT INTO shifts (schedule_id, start, end, employee_id, position_id, creation_time) VALUES (?,?,?,?,?,NOW())'
}