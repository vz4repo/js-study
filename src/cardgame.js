/******************************************************************
 * 
 * 변수 선언  
 * 
******************************************************************/
// 대표 상수
const CARDS_NUM = 52 - 1; // 카드 덱에 있는 수
const PLAYGROUND_SIZE = 5; // 게임에서 깔아주는 카드 갯수. pair의 수와 동일.

// 위치
const playground = document.querySelector('#playground');
const scoreBoard = document.querySelector('#scoreBoard');
const timer = document.querySelector('#timer');
const btnStart = document.querySelector('#btnStart');
const record = document.querySelector('#record');

let quizSet = new Set();           // quizSet 선언+초기화
let quizArr = [];                  // quizArr 선언+초기화
let tmpString = '';                // innerHTML에 쓰일 임시 문자열 선언+초기화
let imgPath = [];                  // addEventListener에 쓰일 NodeList 선언+초기화

let cntSelected = 0;               // 선택된 카드 count
let cntPair = 0;                   // 성공 count
let cntTry = 0;                    // 시도 count

let isValueEqual;
let first;                         // 첫 선택 카드
let second;                        // 두번째 선택 카드

let isStarted = false;             // 시작상태 확인 플래그
let startTime;                     // 시작시간
let checkInterval;                 // 종료체크 인터벌
let onTimer;                       // 타이머


/******************************************************************
 * 
 * function: onload  
 * 
******************************************************************/
window.onload = function() {
	console.log("[window onload]");
	start();
}; 		

/******************************************************************
 * 
 * start() :: 시작버튼 활성/비활성 토글 
 * 
******************************************************************/
function start() {
    // 0. 이미 start된 게임인 경우 일시정지
    if(isStarted) {
        console.error(":: PAUSE ::");
        // pause(); // 미구현ㅠ
        return;
    }

	// 1. 게임 시작 전 초기화( btn시작:활성화 )
	init();
    changeBtn('게임중');
    
	// 1.1 게임 시작
	shuffle();      // 섞고 
	addEvent();
	flipAll();      // 모두 보여주고
	hideAll();      // 모두 감추기
    printScoreBoard();

    // 1.2 Interval 시작
    onTimer = setInterval(function(){           // 타이머 on
        timer.innerHTML = 
            ((Date.now() - startTime)/1000).toFixed(3);} // 소수점 3자리까지
            , 10);
    checkInterval = setInterval(finishGame, 20); // 게임 종료 지속적(20ms) 체크
}

/******************************************************************
 * 
 * init() :: 초기화 
 * 
******************************************************************/
function init() {
	quizSet.clear();
	quizArr = [];
	tmpString = '';
	playground.innerHTML = '';
	cntPair = 0;
	cntSelected = 0;
	cntTry = 0;
    isValueEqual = '';
    first = '';
    second =  '';
    startTime = Date.now();
    isStarted = true;
}

/******************************************************************
 * 
 * shuffle() :: 섞기(감춘 상태? 뒤집은 상태?) 
 * 
******************************************************************/
function shuffle() {
	// 1. PLAYGROUND_SIZE 만큼의 quizSet에 랜덤값 넣기
	for (let i = 0; i < CARDS_NUM; i++) {
		quizSet.add(Math.floor(Math.random() * CARDS_NUM)); // 0 이상 CARDS_NUM 이하의 정수
		if (quizSet.size === PLAYGROUND_SIZE) break;
	}
	// 2. quizSet quizArr에 저장 2회
	quizArr = Array.from(quizSet);
	quizArr = quizArr.concat(quizArr);

	// 3. quizSet 무작위 정렬
	quizArr.sort(() => Math.random() - 0.5);
    
	// 4. quizArr 내용 저장
	for (card of quizArr) {
		tmpString += `<img class="card_img" src="./card_img/${card}.png" />`;
	}
	// 5. quizArr 출력
	playground.innerHTML = tmpString;
}

/******************************************************************
 * 
 * addEvent() :: 각 img 태그에 addEventListener
 * 
******************************************************************/
function addEvent() {
	imgPath = document.querySelectorAll('.card_img');   // 모든 img태그의 NodeList 가져오기
	imgPath.forEach((e) => {                            // 각 img에 'click' 이벤트 추가
		e.addEventListener('click', function() {
            getImageSrc(this);                          // 클릭된 이미지의 src
		});
        // e.addEventListener('click', getImageSrc(this));
	});
}

/******************************************************************
 * 
 * getImageSrc(item) :: 클릭된 이미지의 src 출력
 * 
******************************************************************/
function getImageSrc(item) {
	if (item.classList.contains('selected')) {  // 대상에 .selected 존재의 경우 ->
		item.classList.remove('selected');      // 같은걸 눌렀으니 .selected 제거
        first = '';                             // first 값 초기화
		cntSelected--;
	} else if (cntSelected === 2) {             // 현재 선택된 대상 2개인 경우 ->
		console.error('NO MORE SELECTION');     // 선택은 2개 이상 할 수 없다
	} else if (cntSelected === 1) {             // 현재 선택된 대상 1개인 경우
		item.classList.add('selected');         // .selected 부여
		second = item;                          // first에 값 부여
        // isEqual(a,b) 호출
        isEqual(first, second);                 
	} else if (cntSelected === 0) {             // 현재 선택된 대상 0개인 경우(.selected 부재의 경우) -> 
		item.classList.add('selected');         // .selected 부여
		first = item;                           // second에 값 부여
		cntSelected++;
	} else{                                     // 그 외의 경우 ->
        console.error(`first:[${first}], second:[${second}], selected:[${cntSelected}]`)
    }
}

/******************************************************************
 * 
 * hideAll() ::): 전체 감추기 
 * 
******************************************************************/
function hideAll() {
	let cardList = document.querySelectorAll('.card_img');

	cardList.forEach((item, index) => {         // 모든 .card_img에 적용
        item.classList.add('card_hidden');      // .card_hidden 추가
		item.classList.remove('flipped');       // .flipped     제거
	});
}

/******************************************************************
 * 
 * flipAll() :: 전체 뒤집기 
 * 
******************************************************************/
function flipAll() {
	let cardList = document.querySelectorAll('.card_img');

    cardList.forEach((item, index) => {         // 모든 .card_img에 적용
		item.classList.add('flipped');          // .flipped     추가
        item.classList.remove('card_hidden');   // .card_hidden 제거
	});
}

/******************************************************************
 * 
 * hide() :: 하나 감추기 
 * 
******************************************************************/
function hide() {
	document.querySelector('.card_img').setAttribute('src', './card_img/back.png');
}

/******************************************************************
 * 
 * flip() :: 하나 뒤집기 
 * 
******************************************************************/
function flip() {
	// 1. 하나 뒤집기
	// 2. 하나 이미 뒤집힌 상태에서 뒤집기
}

/******************************************************************
 * 
 * isEqual(card a, card b) :: 비교하기 
 *  
 ******************************************************************/
function isEqual(a, b) {
    // 카드 value로 비교 (T/F) 
    isValueEqual = a.attributes.src.value == b.attributes.src.value ? true : false;
    
    if (isValueEqual) {                     // 같은 경우 ->
        first.classList.add('correct');     // .correct 부여. css에서 pointer-event 금지
        second.classList.add('correct')     // .correct 부여. css에서 pointer-event 금지
        cntPair++;
    } else {
        /* 다른 경우도 특별히 해줄게 있나?? */
    }
    
    first.classList.remove('selected');     // .selected 제거   
    second.classList.remove('selected');    // .selected 제거       
    cntTry++;                               // 시도 count 갱신
    cntSelected = 0;                        // 선택카드 count 초기화

    // scoreBoard 갱신
    printScoreBoard();
} 

/******************************************************************
 * 
 * printScoreBoard() :: pair카드 count 갱신
 * 
******************************************************************/
function printScoreBoard(){
    scoreBoard.innerHTML = `<h2>pair : [${cntPair}] | try : [${cntTry}]</h2>`;
}

/******************************************************************
 * 
 * finishGame() :: 게임 종료 수행 *
 * 
******************************************************************/
function finishGame(){
    if (cntPair === PLAYGROUND_SIZE) {
        changeBtn('시작');                       // '게임중' -> '시작' 으로 변경
        clearInterval(onTimer);                 // Interval 종료
        clearInterval(checkInterval);           // Interval 종료
        isStarted = false;                      // flag false 처리
        writeData()                             // localStorage 입력
        readData();                             // localStorage 출력
        scoreBoard.innerHTML = `<h1>총 시도 : [${cntTry}] | 성공률 : [${(cntPair/cntTry*100).toFixed(0)}%] | 소요시간 : [${timer.textContent}초]</h1>`;
        timer.innerHTML = `<h1>:: 종료 ::</h1>`; // 타이머에 종료로 
    }
}

/******************************************************************
 * 
 * changeBtn(btnText) :: 버튼 내용 변경 
 * 
******************************************************************/
function changeBtn(btnText){
    // 버튼이 시작인 경우 ->    
    btnText === '시작' ? btnStart.classList.remove('isStrated') : btnStart.classList.add('isStarted');
    btnStart.innerHTML = btnText;                   // 버튼 내용 btnText로 변경
    console.log(`Status has been changed -> [ ${btnText} ]`);        // 버튼 내용 변경 내역 console 출력    
}

/******************************************************************
 * 
 * writeData() :: localStorage 이용한 JSON 형식 저장 
 * 
******************************************************************/
function writeData() {
    // JSON 형태로 저장할 기록객체
    let newRecord = {
        name       : 'default'
        ,gameSize  : PLAYGROUND_SIZE
        ,totalTry  : cntTry 
        ,startTime : startTime
        ,timeTaken : timer.textContent
    };

    // index 불러오기
    let maxIndex = localStorage.getItem('maxIndex') || -1;
    maxIndex++;

    // index로 키 생성
    const key = 'record_' + maxIndex; 

    localStorage.setItem(key, JSON.stringify(newRecord));           
    localStorage.setItem('maxIndex', maxIndex);         

    console.log('[SUCCESS] Data has been written to localStorage');
}

/******************************************************************
 * 
 * readData() :: localStorage 이용한 JSON 형식 가져오기 
 * 
******************************************************************/
function readData() {
    // index 불러오기
    const maxIndex = localStorage.getItem('maxIndex');
    
    // index validation
    if(maxIndex === null){      // undef 인가? 아님 .?, ?? 사용??
        console.error(":: index null ::")
        return;
    }

    // index만큼 순환. (배열이 아님에 주의)
    for(let i = 0; i <= maxIndex; i++){
        
        let key = 'record_'+i;                              // 키 조합
        let jsonRecord = localStorage.getItem(key);         // localStorage에 key('key') 이용해서 가져오기
        
        if(jsonRecord){ // 데이터 있는 경우
            const parsedRecord = JSON.parse(jsonRecord);    // 객체로 파싱
            
            // 화면에 출력
            record.innerHTML += `<h3> <${i==maxIndex?'최신':i}> 
                                    이름   : [${parsedRecord.name}] 
                                    | 성공률   : [${((parsedRecord.gameSize)/parsedRecord.totalTry*100).toFixed(0)}%] 
                                    | 소요시간 : [${parsedRecord.timeTaken}초]</h3>`
            ;             
        }else {         // 데이터 없는 경우
            console.error('[ERROR] No data found in localStorage with the specified key');
        }
    }
    console.log(`[SUCCESS] Retrieved JSON Record & Parsed : [ ${maxIndex} ]`);
}

 /* TODO !! 나중에 구현...... */
// start() 수행하고나서 changeBtn('일시정지'). 일시정지 status 추가
// '게임중' -> (종료) -> '시작' 으로 변경