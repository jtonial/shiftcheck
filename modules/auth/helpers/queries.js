/*
  User queries
*/

module.exports = queries = {
  'insert'          : 'INSERT INTO users (first_name, last_name, employer_id, username, email, password, reg_time, last_login) VALUES (?,?,?,?,?,?,NOW(),NOW())',

  'selectById'      : 'SELECT u.user_id AS id, u.first_name, u.last_name, u.email, u.password, s.supplier_id, s.company_name, s.verified, UNIX_TIMESTAMP(s.reg_time) as supplier_reg_time, s.licence_number, s.licence_expiry_date FROM users AS u LEFT JOIN suppliers AS s USING (user_id) WHERE user_id=? LIMIT 1',
  'selectForLogin'  : 'SELECT u.user_id, u.password, u.first_name, u.last_name, u.admin, u.employer_id FROM users AS u WHERE email=? LIMIT 1',

  'update'          : 'UPDATE users SET first_name=?, last_name=?, email=?, admin=? WHERE user_id=?',
  'updateLogin'     : 'UPDATE users SET last_login=NOW(), login_count=login_count+1 WHERE user_id=? LIMIT 1',

  'changePassword'  : 'UPDATE users SET password=? WHERE user_id=?',

  'deactivateEmployee'      : 'UPDATE employees SET active=0 WHERE user_id=?',
  'delete'                  : 'UPDATE employees SET deleted=1 WHERE user_id=?'
  
};
