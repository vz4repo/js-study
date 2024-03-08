CREATE TABLE dev.cardgame_record (
	seq INT auto_increment NOT NULL,
	username VARCHAR(50) DEFAULT '테스트' NOT NULL,
	playsize INT NOT NULL,
	try_cnt INT NOT NULL,
	start_time INT UNSIGNED NOT NULL,
	time_taken FLOAT(5,3) NOT NULL,
	CONSTRAINT cardgame_PK PRIMARY KEY (seq)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
