const path = location.pathname.split('/');
const roomID = path[path.length - 1];
const followerElements = document.querySelectorAll('.follower');
const dammyContainer = document.querySelectorAll('.dammyContainer');
const selectedFollowers = document.getElementById('selected');
const selectBtn = document.getElementById('selectBtn');
const decision = document.getElementById('decision');

// 選んだフォロワーの技構成を下画面に表示する関数
const showToggle = (e) => {
    const elementID = e.target.id;
    const skillsDocumentID = elementID + 'Skills';
    const skillsContainer = document.getElementById(skillsDocumentID);
    const skillsAllContainer = document.querySelectorAll('.skillsContainer');
    for (let j = 0; j < skillsAllContainer.length; j++) {
        skillsAllContainer[j].style.display = 'none';
        followerElements[j].style.backgroundColor = '#fbf0e4';
    }
    e.target.parentNode.style.backgroundColor = '#FFE3CE';
    selectBtn.dataset.followerid = elementID;
    skillsContainer.style.display = 'block';
    if (selectedFollowers.classList.contains(elementID)) {
        selectBtn.style.opacity = 0.25;
        selectBtn.disabled = true;
    } else {
        selectBtn.style.opacity = 1;
        selectBtn.disabled = false;
    }
};

// 対戦に出すフォロワーを選択した際の処理をする関数
const selectFollower = (e) => {
    const selectedID = e.target.dataset.followerid;
    const selectedFollower = document.getElementById(selectedID);
    const selectedFollowerImg = document.getElementById(selectedID + 'Img').getAttribute('src');
    const imgElement = document.createElement('img');
    const inputElement = document.createElement('input');
    imgElement.setAttribute('src', selectedFollowerImg);
    //imgElement.dataset.followerid = selectedID;
    selectedFollowers.appendChild(imgElement);
    inputElement.setAttribute('name', selectedID);
    decision.appendChild(inputElement);
    // 選択したフォロワーを選択不可にする
    selectedFollowers.classList.add(selectedID);
    // 3人目のフォロワーを選択したら選び直すか決定するか選ぶUIに切り替え
    if (selectedFollowers.className.split(' ').length === 4) {
        selectBtn.style.display = 'none';
        decision.style.display = 'block';
    } else {
        selectBtn.style.opacity = 0.25;
        selectBtn.disabled = true;
    }
}

window.onload = () => {
    followerElements[0].style.backgroundColor = '#FFE3CE';
    decision.action = '/matchRoom/' + roomID;
}

for (let i = 0; i < followerElements.length; i++) {
    const followerElementHeight = window.getComputedStyle(followerElements[i]).getPropertyValue('height');
    dammyContainer[i].style.height = followerElementHeight;
    followerElements[i].addEventListener('click', showToggle, false);
};

selectBtn.addEventListener('click', selectFollower, false);

// socket.io処理--------------------------------------------------------------------
let socket = io();
let flg = false; 
const types = [];

followersType.forEach(type => {
    types.push(type);
});

socket.emit('joinPreparationRoom', {
    roomID,
    types
});

socket.on('myFollowersType', data => {
if (flg === false) {
    const enemyTypes = data.types;
    // 敵のフォロワーたちのタイプを要素に入れる-----------------
    const enemyTypesDoc = document.getElementById('enemyTypes');
    enemyTypes.forEach((type, index) => {
        const span = document.createElement('span');
        if (index === 0) {
            span.textContent = '相手のフォロワーのタイプは' + type + ', ';
            enemyTypesDoc.appendChild(span);
        } else if (index != 5) {
            span.textContent = type + ', ';
            enemyTypesDoc.appendChild(span);
        } else {
            span.textContent = type + 'です';
            enemyTypesDoc.appendChild(span);
        }
    });
    flg = !flg;
    if (flg === true) {
    socket.emit('sendMyFollowersType', {
        roomID,
        types
    });
    }
}
});
// ---------------------------------------------------------------------------------
