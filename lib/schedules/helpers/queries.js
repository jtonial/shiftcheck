module.exports = queries = {

  'insert'                  : 'INSERT INTO schedules (employer_id, date, timezone, creation_time) VALUES (?,?,?,NOW())',

  'selectById'              : 'SELECT schedule_id as id, employer_id, date, timezone, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM schedules WHERE schedule_id=? LIMIT 1',

  'selectSchedulesFuture'   : 'SELECT schedule_id as id, date, timezone, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM schedules WHERE employer_id=? AND date>=NOW()',
  // 'selectScheduleDate'      : 'SELECT schedule_id as id, date, type, timezone FROM schedules WHERE employer_id=? AND date=? AND awaitingupload = false AND published = true LIMIT 1',

  'update'                  : 'UPDATE schedules SET date=?, timezone=?, published=? WHERE schedule_id=?'

}
