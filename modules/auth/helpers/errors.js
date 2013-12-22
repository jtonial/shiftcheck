require(__basePath+'/connections/logger').info('Loading error responses...');

module.exports = queries = {

  'invalidEmail' : {
    'code'    : 'invalid_email',
    'message' : 'Invalid or missing email.'
  },
  'invalidFirstName' : {
    'code'    : 'invalid_first_name',
    'message' : 'Invalid or missing first name'
  },
  'invalidLastName' : {
    'code'    : 'invalid_last_name',
    'message' : 'Invalid or missing last_name'
  },
  'invalidPassword' : {
    'code'    : 'invalid_password',
    'message' : 'Invalid or missing password'
  },
  'noCompanyName' : {
    'code'    : 'no_company_name',
    'message' : 'A company name must be provided with a supplier account'
  }

}
