module.exports = queries = {

  'selectEmployer'          : 'SELECT * FROM employers WHERE employer_id=? LIMIT 1',

  'insertEmployer'          : 'INSERT INTO employers (name, email, username, password, salt, contact_email, contact_phone, contact_address, reg_time) VALUES (?,?,?,?,?,?,?,?,NOW())',

  'updateEmployerLogin'     : 'UPDATE employers SET login_count=login_count+1, last_login=NOW() WHERE employer_id=?',

  'changeEmployerPassword'  : 'UPDATE employers SET password=? WHERE employer_id=? AND password=? LIMIT 1',

}
