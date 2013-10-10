module.exports = queries = {

  'selectById'              : 'SELECT position_id as id, position, full_name, description, `order` FROM positions WHERE position_id=? LIMIT 1',
  'selectPositions'         : 'SELECT position_id as id, position, full_name, description, `order` FROM positions WHERE employer_id=? AND active=1',

  'insert'                  : 'INSERT INTO positions (employer_id, position, full_name, description, `order`) VALUES (?,?,?,?,?)',

  'update'                  : 'UPDATE positions SET position=?, full_name=?, description=?, `order`=? WHERE position_id=? LIMIT 1',

  'deactivate'              : 'UPDATE positions SET active=0 WHERE position_id=?',

  'selectShiftsFuture'      : 'SELECT shift_id FROM shifts JOIN schedules USING (schedule_id) WHERE position_id=? AND date>=NOW() AND awaitingupload = false'
}
