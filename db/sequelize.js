var Sequelize = require('sequelize')
  , sequelize = new Sequelize('scheduleme', 'root', 'password', {
      logging: true,
      define: {
        underscored: true
      }
    });

var Employer  = sequelize.define('employers', {
		name: Sequelize.STRING,
		email: {
      type: Sequelize.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
		username: Sequelize.STRING,
		password: Sequelize.STRING,

		contact_email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true
      }
    },
		contact_phone: {
      type: Sequelize.STRING
    },
		contact_address: Sequelize.STRING,

		img: Sequelize.STRING,

		last_login: Sequelize.DATE,
		login_count: Sequelize.INTEGER
	},{
    instanceMethods: {
      updateLoginCount: function () {
        this.login_count+=1;
        return this.save();
      }
    }
  }
  );
var Employee = sequelize.define('employees', {
		email: {
      type: Sequelize.STRING,
      unique: true
    },
		username: Sequelize.STRING,
		password: Sequelize.STRING,

		first_name: Sequelize.STRING,
		last_name: Sequelize.STRING,
		
		login_count: Sequelize.INTEGER,
		last_login: Sequelize.DATE
	},//Create object methods for incrementing login_count
  {
    instanceMethods: {
      updateLoginCount: function () {
        this.login_count+=1;
        return this.save();
      }
    }
  }
	);
var Schedule = sequelize.define('schedules', {
		date: Sequelize.DATE,
		type: Sequelize.STRING,
		image_loc: Sequelize.STRING
	})
var Position = sequelize.define('positions', {
		name: Sequelize.STRING,
    short_name: Sequelize.STRING
	})
var Shift = sequelize.define('shifts', {
    start: Sequelize.DATE,
    end: Sequelize.DATE
  })

//Replicate foreign keys
Employer.hasMany(Employer, {as: 'Employees'})
Employer.hasOne(Employer, {as: 'Employer'})
Employer.hasMany(Position, {as: 'Positions'})

Employee.hasOne(Employer, {as: 'Employer'})
Employee.hasMany(Position, {as: 'Positions'})
Position.hasMany(Employee, {as: 'Employees'})

Schedule.hasMany(Shift, {as: 'Shifts'})
Shift.hasOne(Employee, {as: 'Employee'})
Shift.hasOne(Position, {as: 'Position'})






/*var chainer = new Sequelize.Utils.QueryChainer
  , person  = Person.build({ 
  		name: 'Luke' 
  	})
  , mother  = Person.build({ 
  		name: 'Jane' 
  	})
  , father  = Person.build({ 
  		name: 'John' 
  	})
  , brother = Person.build({ 
  		name: 'Evan' 
  	})
  , sister  = Person.build({ 
  		name: 'Katherine' 
  	})
  , pet     = Pet.build({ 
  		name: 'Maggie'
  	})*/

sequelize.sync({force:true}).on('success', function() {
  /*chainer
    .add(person.save())
    .add(mother.save())
    .add(father.save())
    .add(brother.save())
    .add(sister.save())
    .add(pet.save())
  
  chainer.run().on('success', function() {
    person.setMother(mother).on('success', function() { person.getMother().on('success', function(mom) {
       console.log('my mom: ', mom.name) 
    })})
    person.setFather(father).on('success', function() { person.getFather().on('success', function(dad) {
       console.log('my dad: ', dad.name) 
    })})
    person.setBrothers([brother]).on('success', function() { person.getBrothers().on('success', function(brothers) {
       console.log("my brothers: " + brothers.map(function(b) { return b.name }))
    })})
    person.setSisters([sister]).on('success', function() { person.getSisters().on('success', function(sisters) {
       console.log("my sisters: " + sisters.map(function(s) { return s.name }))
    })})
    person.setPets([pet]).on('success', function() { person.getPets().on('success', function(pets) {
      console.log("my pets: " + pets.map(function(p) { return p.name }))
    })})
  }).on('failure', function(err) {
    console.log(err)
  })*/
})
