// 태양계 데이터: 6종류의 천체에 대한 특징(text)과 이미지 파일(image)을 준비합니다.
// id는 나중에 두 카드가 짝이 맞는지 확인할 때 사용됩니다.
const solarSystemData = [
    { id: 1, type: 'text', content: '우리 태양계의 중심이며 스스로 빛을 내는 아주 뜨거운 별이에요.' },
    { id: 1, type: 'image', content: './images/planet_sun_1789263278905.jpg' },
    { id: 2, type: 'text', content: '태양에서 가장 가깝고, 표면에 구덩이가 많은 행성이에요.' },
    { id: 2, type: 'image', content: './images/planet_mercury_1789263291119.jpg' },
    { id: 3, type: 'text', content: '두꺼운 구름으로 덮여 있어 밤하늘에서 제일 밝게 빛나요.' },
    { id: 3, type: 'image', content: './images/planet_venus_1789263303627.jpg' },
    { id: 4, type: 'text', content: '바다와 공기가 있어서 우리가 살고 있는 푸르고 아름다운 행성이에요.' },
    { id: 4, type: 'image', content: './images/planet_earth_1789263332329.jpg' },
    { id: 5, type: 'text', content: '흙이 붉은색이어서 붉은 행성이라 불리며 탐사선이 많이 가요.' },
    { id: 5, type: 'image', content: './images/planet_mars_1789263344430.jpg' },
    { id: 6, type: 'text', content: '태양계에서 가장 덩치가 크고, 표면에 줄무늬가 있는 가스 행성이에요.' },
    { id: 6, type: 'image', content: './images/planet_jupiter_1789263357965.jpg' }
];

const grid = document.getElementById('grid'); // 게임판 요소를 가져옵니다.
const restartBtn = document.getElementById('restart-btn'); // 다시 시작 버튼 요소를 가져옵니다.

// 게임 상태를 기억할 변수들입니다.
let hasFlippedCard = false; // 카드를 한 장 뒤집었는지 여부
let lockBoard = false; // 두 장을 뒤집고 결과를 확인하는 동안 다른 카드를 못 누르게 잠그는 역할
let firstCard, secondCard; // 첫 번째 뒤집은 카드와 두 번째 뒤집은 카드를 저장
let matchedPairs = 0; // 몇 쌍을 맞췄는지 셉니다. 8쌍이 되면 게임 끝!

// 배열(카드 목록)의 순서를 무작위로 섞어주는 함수입니다.
function shuffle(array) {
    // 배열의 끝에서부터 처음으로 거꾸로 가면서 무작위 위치의 요소와 자리를 바꿉니다.
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // array[i]와 array[j]의 위치를 바꿉니다.
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 게임판을 초기화하고 카드를 배치하는 함수입니다.
function initGame() {
    // 1. 상태 변수들을 초기화합니다.
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    matchedPairs = 0;

    // 2. 게임판을 비웁니다.
    grid.innerHTML = '';

    // 3. 태양계 데이터를 무작위로 섞습니다.
    const shuffledCards = shuffle([...solarSystemData]);

    // 4. 섞인 데이터를 바탕으로 카드 HTML 요소를 만들어 화면에 추가합니다.
    shuffledCards.forEach(cardData => {
        // 카드 전체를 감싸는 div 태그를 만듭니다.
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = cardData.id; // 나중에 짝을 확인하기 위해 id를 몰래 숨겨둡니다.

        // 카드 안쪽 요소(앞면, 뒷면)를 만듭니다.
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        // 카드 뒷면 (처음에 보이는 물음표 면)
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = '?';

        // 카드 앞면 (뒤집었을 때 보이는 글씨나 그림 면)
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        // 데이터가 글씨인지 이미지인지에 따라 다른 스타일(클래스)을 적용합니다.
        if (cardData.type === 'text') {
            cardFront.classList.add('card-text');
            cardFront.textContent = cardData.content;
        } else if (cardData.type === 'image') {
            const imgElement = document.createElement('img');
            imgElement.src = cardData.content;
            imgElement.classList.add('card-img');
            cardFront.appendChild(imgElement);
        }

        // 조립하기: 안쪽 요소에 앞, 뒷면을 붙이고, 바깥 카드에 안쪽 요소를 붙입니다.
        cardInner.appendChild(cardBack);
        cardInner.appendChild(cardFront);
        cardElement.appendChild(cardInner);

        // 카드를 클릭했을 때 벌어질 일(함수)을 연결해줍니다.
        cardElement.addEventListener('click', flipCard);

        // 완성된 카드를 게임판에 넣습니다.
        grid.appendChild(cardElement);
    });
}

// 카드를 클릭했을 때 실행되는 함수입니다.
function flipCard() {
    // 보드가 잠겨있거나, 방금 클릭한 첫 번째 카드를 또 클릭한 거라면 아무 일도 일어나지 않습니다.
    if (lockBoard) return;
    if (this === firstCard) return;

    // 클릭한 카드에 'flip' 클래스를 추가하여 뒤집는 애니메이션을 실행합니다.
    this.classList.add('flip');

    // 카드를 아직 하나도 안 뒤집은 상태라면 (첫 번째 카드 클릭)
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this; // 내가 방금 클릭한 카드를 첫 번째 카드로 기억합니다.
        return;
    }

    // 카드를 이미 하나 뒤집은 상태라면 (두 번째 카드 클릭)
    secondCard = this;
    
    // 두 카드가 짝이 맞는지 확인합니다.
    checkForMatch();
}

// 두 카드의 짝이 맞는지 확인하는 함수입니다.
function checkForMatch() {
    // 첫 번째 카드의 id와 두 번째 카드의 id가 같은지 비교합니다.
    let isMatch = firstCard.dataset.id === secondCard.dataset.id;

    if (isMatch) {
        // 짝이 맞았다면 카드를 비활성화합니다.
        disableCards();
    } else {
        // 짝이 틀렸다면 카드를 다시 뒤집습니다.
        unflipCards();
    }
}

// 짝이 맞았을 때 호출되는 함수입니다.
function disableCards() {
    // 더 이상 클릭하지 못하도록 클릭 이벤트를 지우고 'matched' 클래스를 추가합니다.
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchedPairs++; // 맞춘 쌍의 개수를 1 늘립니다.
    
    // 6쌍을 모두 맞췄다면 축하 메시지를 띄웁니다.
    if (matchedPairs === 6) {
        // 카드 뒤집히는 애니메이션이 끝날 시간을 조금 벌어준 뒤(0.5초) 메시지를 띄웁니다.
        setTimeout(() => {
            alert('축하합니다! 모든 천체의 짝을 찾았어요! 🎉🚀');
        }, 500);
    }

    // 변수들을 초기화하여 다음 카드를 뒤집을 수 있게 준비합니다.
    resetBoard();
}

// 짝이 틀렸을 때 호출되는 함수입니다.
function unflipCards() {
    lockBoard = true; // 카드가 다시 뒤집히는 동안 다른 카드를 클릭하지 못하게 막습니다.

    // 1초(1000밀리초) 뒤에 'flip' 클래스를 제거하여 카드를 원래대로 엎어놓습니다.
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        // 변수들을 초기화합니다.
        resetBoard();
    }, 1000);
}

// 한 턴이 끝난 후 상태 변수들을 처음으로 되돌리는 함수입니다.
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// 다시 시작 버튼을 누르면 initGame 함수를 실행하여 게임을 리셋합니다.
restartBtn.addEventListener('click', initGame);

// 웹 페이지가 처음 열릴 때 게임을 한 번 세팅합니다.
initGame();
