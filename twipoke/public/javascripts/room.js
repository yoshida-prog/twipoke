
const enemyContainer = document.getElementById('enemyContainer');
const enemyTwiInfo = document.getElementById('enemyTwiInfo');
const matchStartBtn = document.getElementById('matchStartBtn');
const enemyNameID = document.getElementById('enemyNameID');
let flg = false;

// socket.io接続後、対戦部屋作成イベントを発火
let socket = io();

if (isCameSearchID === true) {
    socket.emit('enemyCheck', {
        roomID,
        isCameSearchID
    });
}

socket.on('redirectSearchPage', data => {
    location.href = referer;
})

socket.emit('join', {
    roomID,
    profileImage,
    twitterName,
    twitterID,
    rate,
    win,
    lose
});

// 対戦部屋に2人目が入室したらサーバー側から相手のデータを受け取りフロントに反映させる
// その後、自分のデータを相手に送信するイベントを発火
socket.on('sendMyData', data => {
    if (flg === false) {
        const imgElement = document.createElement('img');
        const enemyDatas = [data.twitterName, data.twitterID];
        const enemyBattleDatas = [(data.win + data.lose) + '戦 ', data.win + '勝 ', data.lose + '負'];
        const enemyRating = data.rate;
        const ratingElement = document.createElement('p');
        const battleDatasElement = document.createElement('p');
        ratingElement.textContent = 'レーティング: ' + enemyRating;
        enemyContainer.appendChild(ratingElement);
        imgElement.src = data.profileImage;
        enemyTwiInfo.appendChild(imgElement);
        for (const value of enemyDatas) {
            const p = document.createElement('p');
            p.textContent = value;
            enemyNameID.appendChild(p);
        }
        for (const value of enemyBattleDatas) {
            const span = document.createElement('span');
            span.textContent = value;
            battleDatasElement.appendChild(span);
        }
        enemyContainer.appendChild(battleDatasElement);
        flg = !flg;
        if (flg === true) {
            socket.emit('sendEnemyData', {
                roomID,
                profileImage,
                twitterName,
                twitterID,
                rate,
                win,
                lose
            });
        }
    }
});

// 誰かが入室したら対戦準備開始のボタンを押下可能にする
const mo_enemyContainer = new MutationObserver(() => {
    matchStartBtn.disabled = false;
    matchStartBtn.style.opacity = 1;
});
mo_enemyContainer.observe(enemyContainer, {childList: true});

// 対戦準備開始ボタンを押したら、waitingFlgを持たせてサーバー側で相手が待機状態か確認する
matchStartBtn.addEventListener('click', () => {
    const waitingFlg = true;
    socket.emit('waitingResponse', {
        roomID,
        waitingFlg
    });
});

// もし相手が待機状態であれば双方は対戦準備画面に遷移する。
socket.on('startMatchPreparation', () => {
    const matchRoomForm = document.createElement('form');
    matchRoomForm.action = '/createStatus/' + roomID;
    matchRoomForm.method = 'GET';
    document.body.append(matchRoomForm);
    matchRoomForm.submit();
});

// もし相手が待機状態でなければボタンを非活性にして相手の応答を待つ。
socket.on('waitingEnemy', () => {
    const waitingMsg = '相手の応答を待っています...';
    matchStartBtn.textContent = waitingMsg;
    matchStartBtn.disabled = true;
});