CREATE TABLE employees {
	employee_id INT NOT NULL (PRIMARY KEY),
	email varchar(40) NOT NULL,
	password char(40) NOT NULL,
	first_name varchar(20) NOT NULL,
	last_name varchar(20) NOT NULL,
	employer INT NOT NULL,
	last_login DATE NOT NULL,
	login_count INT NOT NULL,
	reg_time DATE NOT NULL,

	FOREIGN KEY (employer) REFERENCES employers
}
CREATE TABLE employers {
	employer_id INT NOT NULL (PRIMARY KEY),
	email varchar(40) NOT NULL,
	password char(40) NOT NULL,
	contact_email varchar(20) NOT NULL,
	contact_phone varchar(20) NOT NULL,
	contact_address varchar(20) NOT NULL,
	img varchar(50) NOT NULL,
	last_login DATE NOT NULL,
	login_count INT NOT NULL,
	reg_time DATE NOT NULL,
}
CREATE TABLE positions {
	employer INT NOT NULL,
	position varchar(5) NOT NULL,

	PRIMARY KEY (employer, position),
	FOREIGN KEY (employer) REFERENCES employers
}
CREATE TABLE employee_positions {
	/*How do I reference the compound primary key in positions?*/
	employee INT NOT NULL,
	position ____ NOT NULL
}
CREATE TABLE schedules {
	schedule_id INT NOT NULL (PRIMARY KEY)
	employer INT NOT NULL
}
CREATE TABLE shifts {
	
}