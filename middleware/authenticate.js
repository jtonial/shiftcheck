//Customer Authentication middleware

module.exports = function() {    
    return function(req, res, next) {
        //console.log('Authentication middleware running...');
        next();
    }
    
};