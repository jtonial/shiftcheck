use scheduleme;

INSERT INTO employers (`employer_id`, `name`, `email`, `username`, `password`, `contact_email`, `contact_phone`, `contact_address`, `last_login`, `reg_time`)
	VALUES 	(1, 'McDonalds', 'mcds@nritchi.ca', 'mcds', 'ce3e810d5a1c96a77e55d5a2d79fc73dc5a5e6db', 'mcds@nrmitchi.ca', '123-456-7890', '6410 Millcreek Drive', NOW(), NOW()),
			(2, 'Tim Hortons', 'timmies@nrmitchi.ca', 'timmies', '1840fe111f0021c49af9463f45236216d2ab1cea', 'timmies@nrmitchi.ca', '012-345-6789', '6666 Winston Churchill Blvd', NOW(), NOW());

INSERT INTO employees (`employee_id`, `email`, `username`, `password`, `first_name`, `last_name`, `employer_id`, `last_login`, `reg_time`)
	VALUES	(1, 'nick@nrmitchi.ca', 'nick', '01b3ad3301a0b79e9bae3f9b1feb6431a5513687', 'Nick', 'Mitchinson', 1, NOW(), NOW()),
			(2, 'jack@nrmitchi.ca', 'jack', '9a71241f7c521dd59795b8886f43c2011b567b3e', 'Jack', 'Johnson', 1, NOW(), NOW()),
			(3, 'john@nrmitchi.ca', 'john', '2464438fce2dd0a04d56b748c70f87f260517d3d', 'John', 'Jackson', 1, NOW(), NOW()),
			(4, 'steve@nrmitchi.ca', 'steve', '', 'Steve', 'Stephenson', 2, NOW(), NOW()),
			(5, 'holly@nrmitchi.ca', 'holly', '', 'Holly', 'Smithson', 2, NOW(), NOW());

INSERT INTO schedules (`schedule_id`, `employer_id`, `date`, `type`, `creation_time`, `image_loc`)
	VALUES	(1, 1, '2013-01-31', 'day', NOW(), '12BarzTickets.pdf'),
			(2, 1, '2013-02-4', 'day', NOW(), '12BarzTickets.pdf'),
			(3, 1, '2013-02-5', 'day', NOW(), '12BarzTickets.pdf'),
			(4, 1, '2013-02-6', 'week', NOW(), '12BarzTickets.pdf');

INSERT INTO positions (`position_id`, `employer_id`, `position`)
	VALUES 	(1, 1, 'WN'),
			(2, 1, 'DT'),
			(3, 1, 'BK'),
			(4, 1, 'MGR'),
			(5, 1, 'MB'),
			(6, 1, 'MT'),
			(7, 2, 'FRONT'),
			(8, 2, 'KITCHEN'),
			(9, 2, 'DTHRU'),
			(10, 2, 'MGR');

INSERT INTO employee_positions (`ep_id`, `employee_id`, `position_id`)
	VALUES 	(1, 1, 1),
			(2, 1, 2),
			(3, 1, 3),
			(4, 2, 4),
			(5, 2, 5),
			(6, 3, 5),
			(7, 3, 6);
#How can I set default roles for employees of a specific employee? Perhaps flag roles as default?

INSERT INTO shifts (`shift_id`, `schedule_id`, `start`, `end`, `position_id`, `employee_id`)
	VALUES	(1,1,'2013-01-31 07:00','2013-01-31 15:00', 4, 2),
			(2,1,'2013-01-31 08:30','2013-01-31 11:30', 1, 1),
			(3,1,'2013-01-31 12:00','2013-01-31 17:00', 3, 5),
			(3,1,'2013-01-31 15:00','2013-01-31 23:00', 4, 1),
			(3,1,'2013-01-31 18:00','2013-01-31 22:00', 2, 2);