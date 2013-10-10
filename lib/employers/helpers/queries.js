/*
  Employer queries
*/

module.exports = queries = {

  'insert'          : 'INSERT INTO employers (name, contact_email, contact_phone, creation_time) VALUES (?,?,?,NOW())',
  'update'          : 'UPDATE employers SET name=?, contact_email=?, contact_phone=?, img=? WHERE employer_id=?',
  'selectById'      : 'SELECT employer_id AS id, name, contact_email, contact_phone, img, UNIX_TIMESTAMP(creation_time) as creation_time, UNIX_TIMESTAMP(modified_time) as modified_time FROM employers LIMIT 1'
  
  //'delete'          : 'DELETE FROM employers WHERE employer_id=?'
};
