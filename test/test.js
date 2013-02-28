var assert = require("assert")
describe('Array', function(){
  describe('#indexOf()', function(){
	  it('should return -1 when the value is not present', function(){
			assert.equal(-1, [1,2,3].indexOf(5));
  	})
	  it('should return -1 when the value is not present', function(){
			assert.equal(-1, [1,2,3].indexOf(0));
  	})
	})
})
describe('Object', function(){
  describe('#typeof()', function(){
	  it('should return -1 when the value is not present', function(){
			assert.equal('object', typeof {});
  	})
	  it('should return -1 when the value is not present', function(){
			assert.equal('undefined', typeof b);
  	})
	})
})
