module.exports = queries = {

  'insertPosition'          : 'INSERT INTO positions (employer_id, position, full_name, description, `order`) VALUES (?,?,?,?,?)',
  'selectPositions'         : 'SELECT position_id as id, position, full_name, description, `order` FROM positions WHERE employer_id=? AND active=1',

  'deactivatePosition'      : 'UPDATE positions SET active=0 WHERE position_id=? AND employer_id=?'
}
