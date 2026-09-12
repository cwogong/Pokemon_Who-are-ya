// logic.js
let target;
let attempts = 0;
let gameOver = false;

function init() {
    setNewTarget();
    setupAutocomplete(); 
}

function setNewTarget() {
    target = pokemonDB[Math.floor(Math.random() * pokemonDB.length)];
    console.log("정답 힌트:", target.name); 
    document.getElementById('mysteryImage').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${target.id}.png`;
}

function setupAutocomplete() {
    const inputEle = document.getElementById('guessInput');
    
    inputEle.addEventListener('input', function() {
        const val = this.value.trim();
        closeAllLists();
        if (!val) { return false; }
        
        const list = document.getElementById('autocomplete-list');
        
        const filtered = pokemonDB.filter(p => p.name.includes(val));
        
        filtered.forEach(p => {
            const item = document.createElement('div');
            item.innerHTML = p.name.replace(val, `<strong>${val}</strong>`);
            item.addEventListener('click', function() {
                inputEle.value = p.name;
                closeAllLists();
            });
            list.appendChild(item);
        });
    });
}

function closeAllLists() {
    document.getElementById('autocomplete-list').innerHTML = '';
}

document.addEventListener('click', function (e) {
    if (e.target.id !== 'guessInput') {
        closeAllLists();
    }
});

function restartGame() {
    attempts = 0;
    gameOver = false;
    
    document.getElementById('message').innerHTML = ''; 
    document.getElementById('guessInput').value = '';
    document.getElementById('mysteryQuestion').style.display = 'block';
    document.getElementById('mysteryImage').style.display = 'none';

    const board = document.getElementById('gameBoard');
    const rows = board.querySelectorAll('.grid-row');
    rows.forEach(row => row.remove());

    setNewTarget();
}

function revealTarget() {
    document.getElementById('mysteryQuestion').style.display = 'none';
    document.getElementById('mysteryImage').style.display = 'block';
}

// 새롭게 추가된 포기하기 기능
function giveUp() {
    if (gameOver) return; // 이미 끝난 게임이면 무시
    
    gameOver = true;
    closeAllLists(); // 열려있는 자동완성 리스트 닫기
    
    document.getElementById('message').innerHTML = `아쉽네요! 도전을 포기하셨습니다.<br>정답은 <strong>'${target.name}'</strong> 였습니다. 😭`;
    document.getElementById('message').style.color = '#d32f2f'; // 빨간색 텍스트
    
    revealTarget(); // 정답 사진 즉시 공개
}

function makeGuess() {
    if (gameOver) return;

    const inputEle = document.getElementById('guessInput');
    const guessName = inputEle.value.trim();
    const guess = pokemonDB.find(p => p.name === guessName);

    if (!guess) {
        alert('데이터베이스에 없는 포켓몬입니다. 이름을 확인해주세요!');
        return;
    }

    attempts++;
    closeAllLists(); 
    
    const board = document.getElementById('gameBoard');
    const row = document.createElement('div');
    row.className = 'grid-row';

    const isNameCorrect = guess.name === target.name;

    // 0. 사진 
    const imgCell = document.createElement('div');
    imgCell.className = `grid-cell img-cell ${isNameCorrect ? 'correct' : 'incorrect'}`;
    const imgEle = document.createElement('img');
    imgEle.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${guess.id}.png`;
    imgCell.appendChild(imgEle);
    row.appendChild(imgCell);

    // 1. 이름
    row.appendChild(createCell(guess.name, isNameCorrect ? 'correct' : 'incorrect'));

    // 2. 타입
    const typeCell = document.createElement('div');
    typeCell.className = 'grid-cell type-container'; 
    guess.type.forEach(t => {
        const badge = document.createElement('div');
        badge.className = 'type-badge ' + (target.type.includes(t) ? 'correct' : 'incorrect');
        badge.innerText = t;
        typeCell.appendChild(badge);
    });
    row.appendChild(typeCell);

    // 3. 세대
    row.appendChild(createCell(guess.gen + '세대', guess.gen === target.gen ? 'correct' : 'incorrect'));

    // 4. 진화단계
    row.appendChild(createCell(guess.evo, guess.evo === target.evo ? 'correct' : 'incorrect'));

    // 5. 키
    let heightText = guess.height + 'm';
    let heightStatus = 'incorrect';
    if (guess.height === target.height) { 
        heightStatus = 'correct'; 
    } else if (guess.height < target.height) { 
        heightText += ' <span class="arrow-up">↑</span>'; 
    } else { 
        heightText += ' <span class="arrow-down">↓</span>'; 
    }
    row.appendChild(createCell(heightText, heightStatus));

    // 6. 몸무게
    let weightText = guess.weight + 'kg';
    let weightStatus = 'incorrect';
    if (guess.weight === target.weight) { 
        weightStatus = 'correct'; 
    } else if (guess.weight < target.weight) { 
        weightText += ' <span class="arrow-up">↑</span>'; 
    } else { 
        weightText += ' <span class="arrow-down">↓</span>'; 
    }
    row.appendChild(createCell(weightText, weightStatus));

    board.appendChild(row);
    inputEle.value = '';

    if (isNameCorrect) {
        let rank = "";
        if (attempts <= 7) { rank = "마스터볼"; } 
        else if (attempts <= 10) { rank = "하이퍼볼"; } 
        else if (attempts <= 14) { rank = "슈퍼볼"; } 
        else { rank = "몬스터볼"; }

        document.getElementById('message').innerHTML = `축하합니다! ${attempts}번 만에 정답을 맞췄습니다! 🎉<br>당신의 포획 등급은 <span class="rank-text">[${rank}]</span> 입니다!`;
        document.getElementById('message').style.color = '#6aaa64';
        
        revealTarget(); 
        gameOver = true;
    }
}

function createCell(htmlContent, status) {
    const cell = document.createElement('div');
    cell.className = `grid-cell ${status}`;
    cell.innerHTML = htmlContent;
    return cell;
}

window.onload = function() {
    init();
    document.getElementById('guessInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            makeGuess();
        }
    });
};