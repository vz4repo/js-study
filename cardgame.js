const playground = document.querySelector('#playground');
const scoreBoard = document.querySelector('#scoreBoard');
const timer = document.querySelector('#timer');

const CARDS_NUM = 52 - 1; // 카드 덱에 있는 수
const PLAYGROUND_SIZE = 5; // 깔아주는 카드 갯수

let quizSet = new Set(); // quizSet 선언+초기화
let quizArr = []; // quizArr 선언+초기화
let tmpString = ''; // innerHTML에 쓰일 임시 문자열 선언+초기화
let imgPath = []; // addEventListener에 쓰일 NodeList 선언+초기화

let cntSelected = 0; // 선택된 카드 count
let cntPair = 0; // 성공 count
let cntTry = 0; // 시도 count

let isValueEqual;
let first; // 첫 선택 카드
let second; // 두번째 선택 카드

let startTime;  // 시작시간

/* [html 최초 로드 및 이벤트 상시 대기 실시] */
window.onload = function() {
	console.log("");
	console.log("[window onload] : [start]");
	console.log(""); 

// [이벤트 함수 호출]
	start();
}; 		

/* function: 초기화 */
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
}
/* function: 시작버튼 활성/비활성 토글 */
function start() {
	// 1. 게임 시작 전 초기화( btn시작:활성화 )
	init();
	// 1.1 게임 시작 (섞고 - 모두 보여주고 - 모두 감추기)
	shuffle();
	addEvent();
	flipAll();
	hideAll();
    showScoreBoard();
	// setTimeout(hideAll(), 5000); // 왜안되는거야????

	// 2. 게임 중     (btn시작:비활성화, btn종료:활성화 )
	// 3. 게임 종료 후  (btn시작:활성화 )
}
/* function: 전체 감추기 */
function hideAll() {
	let cardList = document.querySelectorAll('.card_img');
	// 모든 .card_img에 .flipped 제거
	cardList.forEach((item, index) => {
        item.classList.add('hidden');
		item.classList.remove('flipped');
	});

}
/* function: 전체 뒤집기 */
function flipAll() {
	let cardList = document.querySelectorAll('.card_img');
	// 모든 .card_img에 .flipped 추가
	cardList.forEach((item, index) => {
		item.classList.add('flipped');
        item.classList.remove('hidden');
	});
}
/* function: 감추기 */
function hide() {
	document.querySelector('.card_img').setAttribute('src', '/card_img/back.png');
}
/* function: 뒤집기 */
function flip() {
	// 1. 하나 뒤집기
	// 2. 하나 이미 뒤집힌 상태에서 뒤집기
}
/* function: 비교하기 */
// 1. 파일명(value) 비교
function isEqual(a, b) {
    isValueEqual = a.attributes.src.value == b.attributes.src.value ? true : false;
    // 각 카드 비교
    if (isValueEqual) {
        // 같은 경우
        // .correct 부여. css에서 pointer-event 금지
        first.classList.add('correct');
        second.classList.add('correct');
        cntPair++;
    } else {
    // 다른 경우
    }

    // .selected 제거
    first.classList.remove('selected');
    second.classList.remove('selected');
    // 시도 count 갱신
    cntTry++;
    // 선택카드 count 초기화
    cntSelected = 0;
    // scoreBoard 갱신
    showScoreBoard();
} 


/* function: 섞기(감춘 상태? 뒤집은 상태?) */
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
		tmpString += `<img class="card_img" src="/card_img/${card}.png" />`;
	}
	// 5. quizArr 출력
	playground.innerHTML = tmpString;
}

/* 각 img 태그에 addEventListener */
function addEvent() {
	// 모든 img태그의 NodeList 가져오기
	imgPath = document.querySelectorAll('.card_img');

	// 각 img에 'click' 이벤트 추가
	imgPath.forEach((e) => {
		e.addEventListener('click', function () {
            getImageSrc(this); // 클릭된 이미지의 src
            if (cntPair === PLAYGROUND_SIZE) {
	            scoreBoard.innerHTML = `<h1>종료!!</h1><br>pair : [${cntPair}] | try : [${cntTry}]</h1>`;
                clearInterval(onTimer);
            }
		});
	});
}

/* 클릭된 이미지의 src 출력 */
function getImageSrc(item) {
	if (item.classList.contains('selected')) {
		// 대상에 .selected 존재의 경우
		item.classList.remove('selected'); // 같은걸 눌렀으니 .selected 제거
        first = ''; // 
		cntSelected--;
	} else if (cntSelected === 2) {
		// 현재 선택된 대상 2개인 경우
		console.error('NO MORE SELECTION'); // 선택은 2개 이상 할 수 없다
	} else if (cntSelected === 1) {
        // 현재 선택된 대상 1개인 경우
		item.classList.add('selected'); // .selected 부여
		second = item; // first에 값 부여
        // isEqual(a,b) 호출
        isEqual(first, second);
	} else if (cntSelected === 0) {
        // 현재 선택된 대상 0개인 경우
		// .selected 부재의 경우
		item.classList.add('selected'); // .selected 부여
		first = item; // second에 값 부여
		cntSelected++;
	} else{
        // 그 외의 경우
        console.error(`first:[${first}], second:[${second}], selected:[${cntSelected}]`)
    }
}

/* pair카드 count 갱신 */
function showScoreBoard(){
    scoreBoard.innerHTML = `<h2>pair : [${cntPair}] | try : [${cntTry}]</h2>`;
}

/* 타이머 */
let onTimer = setInterval(function (){
    timer.innerHTML = ((Date.now() - startTime)/1000).toFixed(3);
}, 10);


// 