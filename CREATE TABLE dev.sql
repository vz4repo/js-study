-- dev.cardgame_record definition
CREATE TABLE cardgame_record (
	seq 			 	int	   (10) 			NOT NULL	 AUTO_INCREMENT
	,playername 	 	varchar(50) 			NOT NULL	 DEFAULT '테스트'
	,difficultylevel 	int    (3) 				NOT NULL	
	,cnttry 		 	int    (5) 				NOT NULL	
	,starttime 		 	bigint (20) unsigned	NOT NULL	
	,timetaken 		 	float  (53) 			NOT NULL	
	,timestamp 		 	timestamp 				NOT NULL	 DEFAULT current_timestamp()
	,PRIMARY KEY (seq)
) 
ENGINE=InnoDB 
AUTO_INCREMENT=1000001 
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;