const express = require("express");
const path = require("path");
// const logger = require("morgan");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const exp = require("constants");
const PORT = process.env.PORT || 5050;

const app = express();

app.use(express.static(path.join(__dirname,"src")))
app.listen(PORT, () => console.log(`[ PORT ]${PORT} + [ DIR ]${__dirname}`))
app.get('/', function(req, res){
    console.log('GET : /');
});
app.get('/test', function(req, res){
    console.log('GET : /test');
    res.send(`THIS IS TEST PAGE | ${express}`);
});
app.use(bodyParser.json());

const pool = mysql.createPool({
    host:'localhost'
    ,user:'root'
    ,password:'root'
    ,database:'dev'
    ,waitForConnections: true
    ,connectionLimit: 15
    ,queueLimit:0
});

// start

// 미들웨어로 클라이언트 요청 검증하기
function validateUserData(req, res, next) {
    const { playerName, difficultyLevel, cntTry, startTime, timeTaken } = req.body;
    
    // 필수 필드 확인
    if (!playerName || !difficultyLevel || !cntTry || !startTime || !timeTaken) {
        console.error(`${playerName} || ${difficultyLevel} || ${cntTry} || ${startTime} || ${timeTaken}`);
        return res.status(400).json({ error: '모든 필드를 제공해야 합니다.' });
    }

    // 데이터 유효성 검증
    // difficultyLevel는 양의 정수여야 함
    // if (typeof difficultyLevel !== 'number' || difficultyLevel <= 0 || !Number.isInteger(difficultyLevel)) {
    //     return res.status(400).json({ error: 'difficultyLevel는 양의 정수여야 합니다.' });
    // }

    // 다른 필드에 대한 검증 로직 추가

    // 검증이 성공한 경우 다음 미들웨어로 전달
    next();
}

// API 엔드포인트 정의
app.get ('/records', getRecords);
app.post('/record' , validateUserData, putRecord);

// 사용자 목록 조회
function getRecords(req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("conn pool에서 conn 가져오기 오류:", err);
            return res.status(500).json({ error: '서버 내부 오류' });
        }
        
        // const query = 'SELECT * from cardgame_record order by difficultylevel desc, timetaken limit 3';
        // const query = 'SELECT * from cardgame_record order by difficultylevel desc, timetaken';
        const query = 'select playername,difficultylevel,timetaken,((difficultylevel/52*100)+difficultylevel)+((difficultylevel/cnttry*100)*3-100)-(timetaken*(52/difficultylevel))*0.8  as score from cardgame_record order by score desc';
        connection.query(query, function(err, result) {
            connection.release(); // 연결 사용 후 반납
            
            if (err) {
                console.error("[SELECT] 쿼리 오류:", err);
                return res.status(500).json({ error: '서버 내부 오류' });
            }
            res.json(result);
        });
    });
}

// 새로운 기록 추가
function putRecord(req, res) {
    const { playerName, difficultyLevel, cntTry, startTime, timeTaken } = req.body;

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("conn pool에서 conn 가져오기 오류:", err);
            return res.status(500).json({ error: '서버 내부 오류(conn)' });
        }

        const query = "INSERT INTO dev.cardgame_record (playerName, difficultyLevel, cntTry, startTime, timeTaken) VALUES (?, ?, ?, ?, ?)";
        const values = [playerName, difficultyLevel, cntTry, startTime, timeTaken];

        connection.query(query, values, (err, result) => {
            connection.release(); // 연결 사용 후 반납
            
            if (err) {
                console.error("[INSERT] 쿼리 오류:", err);
                return res.status(500).json({ error: '서버 내부 오류(query)' });
            }
            res.status(201).json({ message: '새로운 기록이 추가되었습니다.' });
        });
    });
}

// end

/*****************************************************************************************************
app.get('/record', (req,res)=>{
    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("conn pool에서 conn 가져오기 오류:", err);
            callback(err);
            return;
        }
        const query = 'select * from dev.cardgame_record';
        
        connection.query(query, function(err,result){
            connection.release();

            if (err) {
                console.error("[SELECT] 쿼리 오류:", err);
                callback(err);
                return;
            }
            res.json(result);
        });
    });
})

app.put('/record', (req,res) =>{
    const {username,playsize,try_cnt,start_time,time_taken} = req.body;

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("conn pool에서 conn 가져오기 오류:", err);
            return;
        }
        const query = "INSERT INTO dev.cardgame_record"
                    + "(username,playsize,try_cnt,start_time,time_taken)"
                    + " VALUES (?,?,?,?,?)";
        const values = [username,playsize,try_cnt,start_time,time_taken];

        connection.query(query, values, (err, result) =>{
        connection.release();          // 연결 사용 후 반납
            if (err) {
                console.error("[INSERT] 쿼리 오류:", err);
                res.status(500).send('[INTERNAL ERROR] : 500')
                return;
            }
            res.status(201).send('[SUCCESS] add new recorrd');
        });
    });
})
*****************************************************************************************************/

/*****************************************************************************************************
function fetchData(callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("conn pool에서 conn 가져오기 오류:", err);
            callback(err);
            return;
        }

        const query = 'select * from dev.cardgame_record';
        
        connection.query(query, function(err,values){
            connection.release();

            if (err) {
                console.error("[SELECT] 쿼리 오류:", err);
                callback(err);
                return;
            }
            console.log("fetch 완료");
            callback(null, result); // 콜백 함수를 호출하여 결과를 전달
            });
    });
}

    // connection.end((err) => {
    //     if(err) {
    //         console.error("[ERROR] conn end: ", err);
    //         throw err;
    //     }
    //     console.log('=== [SUCCESS] DISCONNECTED ===');
    // });


function insertData(username,playsize,try_cnt,start_time,time_taken, callback) {
    // conn pool에서 conn 가져오기
    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("conn pool에서 conn 가져오기 오류:", err);
            callback(err);
            return;
        }

        const query = "INSERT INTO dev.cardgame_record"
                    + "(username,playsize,try_cnt,start_time,time_taken)"
                    + " VALUES (?,?,?,?,?)";
        const values = [username,playsize,try_cnt,start_time,time_taken];

        connection.query(query, values, function(err, result) {
        connection.release();          // 연결 사용 후 반납

        if (err) {
            console.error("[INSERT] 쿼리 오류:", err);
            callback(err);
            return;
        }
        console.log("새로운 항목 추가");
        callback(null, result); // 콜백 함수를 호출하여 결과를 전달
        });
    });
}

// 모듈로 cardgame.js에 넘기기
module.exports = insertData;
module.exports = fetchData;

************************************************************************************************/