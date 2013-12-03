CREATE DATABASE IF NOT EXISTS shiftcheck;

use shiftcheck;

DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS available_shifts;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS employee_positions;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS employers;


CREATE TABLE employers (

  employer_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name varchar(15) NOT NULL,

  contact_email varchar(20) NOT NULL,
  contact_phone varchar(20) NOT NULL,

  img varchar(50),

  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP

) ENGINE=innodb;

CREATE TABLE users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,

  first_name varchar(15) NOT NULL,
  last_name varchar(15) NOT NULL,
  employer_id INT UNSIGNED NOT NULL,

  admin BOOLEAN NOT NULL DEFAULT 0,

  username varchar(15) NOT NULL,
  email varchar(40) NOT NULL,
  password char(60) NOT NULL,
  
  ssiKey varchar(40),

  active BOOLEAN NOT NULL DEFAULT 1,
  deleted BOOLEAN NOT NULL DEFAULT 0,
  
  last_login DATETIME NOT NULL,
  login_count INT NOT NULL DEFAULT 0,
  reg_time DATETIME NOT NULL,

  modified_time TIMESTAMP

  CONSTRAINT UNIQUE (email),

  CONSTRAINT FOREIGN KEY (employer_id) REFERENCES employers(employer_id)

) ENGINE=innodb;

CREATE TABLE positions (
  position_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employer_id INT UNSIGNED NOT NULL,
  position varchar(5) NOT NULL,
  `order` int NOT NULL,

  full_name varchar(20),
  description varchar(150),

  active BOOLEAN NOT NULL DEFAULT 1,
  deleted BOOLEAN NOT NULL DEFAULT 0,
  
  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP,

  CONSTRAINT UNIQUE (employer_id, position),
  CONSTRAINT FOREIGN KEY (employer_id) REFERENCES employers(employer_id)

) ENGINE=innodb;

CREATE TABLE employee_positions (
  /*How do I reference the compound primary key in positions?*/
  ep_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  position_id INT UNSIGNED NOT NULL,

  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP,

  CONSTRAINT FOREIGN KEY (employee_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE

) ENGINE=innodb;

CREATE TABLE schedules (
  schedule_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employer_id INT UNSIGNED NOT NULL,

  date DATE NOT NULL,
  timezone INT NOT NULL DEFAULT 0, #Minute difference from UTC

  published BOOLEAN NOT NULL DEFAULT false,

  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP,
    
  CONSTRAINT FOREIGN KEY (employer_id) REFERENCES employers(employer_id) ON DELETE CASCADE

) ENGINE=innodb;

CREATE TABLE shifts (
  shift_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT UNSIGNED NOT NULL,

  # These can probably be switch to TIME only
  start INT NOT NULL,
  end INT NOT NULL,

  position_id INT UNSIGNED,
  employee_id INT UNSIGNED,

  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP,
  
  CONSTRAINT FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id), # ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (position_id) REFERENCES positions(position_id), # ON DELETE SET NULL,
  CONSTRAINT FOREIGN KEY (employee_id) REFERENCES users(user_id)  # ON DELETE SET NULL

) ENGINE=innodb;

CREATE TABLE available_shifts (
  available_shift_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shift_id INT UNSIGNED NOT NULL,

  employee_id INT UNSIGNED NOT NULL,
  employer_id INT UNSIGNED NOT NULL,

  notes TEXT,

  active BOOLEAN NOT NULL DEFAULT 1,
  
  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP,

  CONSTRAINT FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE CASCADE,

) ENGINE=innodb;

CREATE TABLE requests (
  request_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  available_shift_id INT UNSIGNED NOT NULL,

  from_employee INT UNSIGNED NOT NULL,
  to_employee INT UNSIGNED NOT NULL,

  state INT NOT NULL DEFAULT 0,
  notes TEXT,
  response_by INT UNSIGNED NOT NULL,

  response_time DATETIME,

  creation_time DATETIME NOT NULL,
  modified_time TIMESTAMP,
  
  CONSTRAINT FOREIGN KEY (available_shift_id) REFERENCES available_shifts(available_shift_id)
  -- CONSTRAINT FOREIGN KEY (from_employee) REFERENCES users(user_id),
  -- CONSTRAINT FOREIGN KEY (to_employee) REFERENCES users(user_id)

) ENGINE=innodb;

-- CREATE TABLE shift_history (
--   history_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--   shift_id INT UNSIGNED NOT NULL,

--   from_employee INT UNSIGNED NOT NULL,
--   to_employee INT UNSIGNED NOT NULL,

--   creation_time DATETIME NOT NULL,
--   modified_time TIMESTAMP,
  
--   CONSTRAINT FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE CASCADE

-- ) ENGINE=innodb;
