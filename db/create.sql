CREATE DATABASE IF NOT EXISTS scheduleme;

use scheduleme;

DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS employee_positions;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS employers;

CREATE TABLE employers (
	employer_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(15) NOT NULL,
	email varchar(40) NOT NULL,
	username varchar(15) NOT NULL,
	password char(40) NOT NULL,
	contact_email varchar(20) NOT NULL,
	contact_phone varchar(20) NOT NULL,
	contact_address varchar(20) NOT NULL,

	img varchar(50) NOT NULL,

	last_login DATETIME NOT NULL,
	login_count INT NOT NULL DEFAULT 0,
	reg_time DATETIME NOT NULL,

	CONSTRAINT UNIQUE (email)

) ENGINE=innodb;

CREATE TABLE employees (
	employee_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	email varchar(40) NOT NULL,
	username varchar(15) NOT NULL,
	password char(40) NOT NULL,
	first_name varchar(20) NOT NULL,
	last_name varchar(20) NOT NULL,
	employer_id INT UNSIGNED NOT NULL,
	last_login DATETIME NOT NULL,
	login_count INT NOT NULL,
	reg_time DATETIME NOT NULL,

	CONSTRAINT FOREIGN KEY (employer_id) REFERENCES employers(employer_id)

) ENGINE=innodb;

CREATE TABLE positions (
	position_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	employer_id INT UNSIGNED NOT NULL,
	position varchar(5) NOT NULL,

	CONSTRAINT UNIQUE (employer_id, position),
	CONSTRAINT FOREIGN KEY (employer_id) REFERENCES employers(employer_id)

) ENGINE=innodb;

CREATE TABLE employee_positions (
	/*How do I reference the compound primary key in positions?*/
	ep_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	employee_id INT UNSIGNED NOT NULL,
	position_id INT UNSIGNED NOT NULL,

	CONSTRAINT FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
	CONSTRAINT FOREIGN KEY (position_id) REFERENCES positions(position_id)

) ENGINE=innodb;

CREATE TABLE schedules (
	schedule_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	employer_id INT UNSIGNED NOT NULL,

	date DATE NOT NULL,
	type ENUM('day','week','twoweek','month') NOT NULL,
	creation_time DATETIME NOT NULL,
	image_loc varchar(45) NOT NULL,
	awaitingupload BOOLEAN NOT NULL DEFAULT true,

	CONSTRAINT FOREIGN KEY (employer_id) REFERENCES employers(employer_id)

) ENGINE=innodb;

CREATE TABLE shifts (
	shift_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	schedule_id INT UNSIGNED NOT NULL,

	start DATETIME NOT NULL,
	end DATETIME NOT NULL,

	position_id INT UNSIGNED NOT NULL,
	employee_id INT UNSIGNED NOT NULL

	CONSTRAINT FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id),
	CONSTRAINT FOREIGN KEY (position_id) REFERENCES positions(position_id),
	CONSTRAINT FOREIGN KEY (employee_id) REFERENCES employees(employee_id)

) ENGINE=innodb;