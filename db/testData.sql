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