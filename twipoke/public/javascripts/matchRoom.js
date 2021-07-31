let socket = io();
let isMerge = false; //相互処理に使う待機状態解除フラグ
let priority = null; //行動の優先順位を決定する
let dyingNum = 0;
let defeatNum = 0;
const myName = document.getElementById('myName');
const myIcon = document.getElementById('myIcon');
const myType = document.getElementById('myType');
const myHP = document.getElementById('myHP');
const myMaxHP = document.getElementById('myMaxHP');
const myHPGauge = document.getElementById('myHPGauge');
const remainingMyHP = document.getElementById('remainingMyHP');
const followerName = myName.textContent;
const followerImg = myIcon.getAttribute('src');
const followerType = myType.textContent;
const followerHP = myHP.textContent;
const followerMaxHP = myMaxHP.textContent;
const enemyName = document.getElementById('enemyName');
const enemyIcon = document.getElementById('enemyIcon');
const enemyType = document.getElementById('enemyType');
const enemyHP = document.getElementById('enemyHP');
const enemyMaxHP = document.getElementById('enemyMaxHP');
const enemyHPGauge = document.getElementById('enemyHPGauge');
const remainingEnemyHP = document.getElementById('remainingEnemyHP');
const fixedScreen = document.getElementById('fixedScreen');
const eventLog = document.getElementById('eventLog');
const selectBtn = document.getElementById('selectBtn');
const followersBtn = document.getElementById('followersBtn');
const skillsBtn = document.getElementById('skillsBtn');
const actionContainer = document.getElementById('action');
const followersElement = document.getElementById('followers');
const enterBtn = document.getElementById('enterBtn');
const myFollower = document.getElementById('myFollower');
const enemyFollower = document.getElementById('enemyFollower');
const weakTypeCompatibility = { // keyが攻撃側、valueが受け側
    fire: 'grass',
    water: 'fire',
    electric: 'water',
    grass: 'water',
    twi: 'normal'
};
const strongTypeCompatibility = {
    fire: 'water',
    water: 'grass',
    electric: 'grass',
    grass: 'fire',
    twi: 'twi'
};
let followerKey = myFollower.dataset.follower;

// setTimeOut
const setTimeOut = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
};

// 3秒後にホーム画面に戻る
const returnHome = (newRate, matchResult) => {
    const postForm = document.createElement('form');
    postForm.action = '/home';
    postForm.method = 'POST';
    document.body.append(postForm);
    postForm.addEventListener('formdata', (e) => {
        let fd = e.formData;
        fd.set('rate', newRate);
        fd.set('result', matchResult);
    });
    postForm.submit();
};

// フォロワーボタンを押したら手持ちのフォロワーを選択する画面を表示非表示切り替えする関数
const followersShowToggle = (e) => {
    const toggledElementID = e.target.parentNode.dataset.follower;
    const skillsElementID = toggledElementID + 'skills';
    const skillsElement = document.getElementById(skillsElementID);
    if (followersElement.classList.contains('followersShowToggle') === true) {
        enterBtn.style.display = 'none';
    } else {
        enterBtn.style.display = 'block';
    }
    followersElement.classList.toggle('followersShowToggle');
    actionContainer.style.marginTop = window.getComputedStyle(fixedScreen).getPropertyValue('height');
    // わざ選択画面が表示中なら非表示にする
    if (skillsElement.classList.contains('skillsShowToggle') === true) {
        skillsElement.classList.toggle('skillsShowToggle');
    }
};

// たたかうボタンを押したらわざを選択する画面を表示非表示切り替えする関数
const skillsShowToggle = (e) => {
    const followerID = e.target.parentNode.dataset.follower;
    const toggledElementID = followerID + 'skills';
    const toggledElement = document.getElementById(toggledElementID);
    if (toggledElement.classList.contains('skillsShowToggle') === true) {
        enterBtn.style.display = 'none';
    } else {
        enterBtn.style.display = 'block';
    }
    toggledElement.classList.toggle('skillsShowToggle');
    actionContainer.style.marginTop = window.getComputedStyle(fixedScreen).getPropertyValue('height');
    // フォロワー選択画面が表示中なら非表示にする
    if (followersElement.classList.contains('followersShowToggle') === true) {
        followersElement.classList.toggle('followersShowToggle');
    }
};

// フォロワーまたはわざを選択した際にフォーカスし、行動決定ボタンに必要なデータセットを渡す関数
const selectAction = (e) => {
    const actionDataset = e.target.dataset;
    const enterBtnDataset = enterBtn.dataset;
    const selectedElement = e.target.parentNode;
    // 意図しない要素をクリックした際の誤作動防止
    if (selectedElement.classList.contains('skill') || selectedElement.classList.contains('followersContainer')) {
        const existSelected= document.getElementsByClassName('selected');
        // 戦闘参加中のフォロワーを選択したなら決定ボタンをアクティブにしない
        if (actionDataset.containertype === 'follower' && followerKey === actionDataset.follower) {
            enterBtn.style.backgroundColor = '#a8a8a8';
            enterBtn.disabled = true;
        } else if (actionDataset.containertype === 'died') {
            return
        } else {
            enterBtn.style.backgroundColor = '#2f2f2f'
            enterBtn.disabled = false;
        }
        // 選択したフォロワー・わざにフォーカスする
        if (existSelected.length === 0) {
            selectedElement.classList.add('selected');
        } else {
            existSelected[0].classList.remove('selected');
            selectedElement.classList.add('selected');
        }
        // 行動決定ボタンにデータセットを追加
        Object.keys(enterBtnDataset).forEach(key => {
            delete enterBtnDataset[key];
        });
        Object.keys(actionDataset).forEach(key => {
            enterBtn.dataset[key] = actionDataset[key];
        });
    } else {
        return
    }
};

// 対戦部屋の専用ルームを建てる
socket.emit('joinMatchRoom', {
    twitterName,
    roomID,
    followerName,
    followerImg,
    followerType,
    followerHP,
    followerAttack: myFollower.dataset.followerattack,
    followerDefense: myFollower.dataset.followerdefense
});

// ルーム入室後に相手のフォロワー情報を取得
socket.on('setEnemyFollower', async (data) => {
    if (isMerge === false) {
        document.getElementById('enemyFollower').style.opacity = 1;
        enemyName.textContent = data.enemyName;
        enemyIcon.setAttribute('src', data.enemyImg);
        enemyType.textContent = data.enemyType;
        enemyHP.textContent = data.enemyHP;
        enemyMaxHP.textContent = data.enemyHP;
        enemyFollower.dataset.enemyattack = data.enemyAttack;
        enemyFollower.dataset.enemydefense = data.enemyDefense;
        eventLog.innerHTML = data.twitterName + 'が勝負を仕掛けてきた!<br>' + data.twitterName + 'は' + data.enemyName + 'をくりだした!';
        isMerge = true;
        socket.emit('sendMyFollower', {
            twitterName,
            roomID,
            followerName,
            followerImg,
            followerType,
            followerHP,
            followerAttack: myFollower.dataset.followerattack,
            followerDefense: myFollower.dataset.followerdefense
        });
    } else if (isMerge === true) {
        isMerge = false;
        await setTimeOut();
        selectBtn.style.opacity = 1;
        followersBtn.disabled = false;
        skillsBtn.disabled = false;
        eventLog.innerHTML = twitterName + 'はどうする?';
        socket.emit('changeIsMerge', {
            roomID
        });
    }
});

// 待機状態解除時のループを回避する処理
socket.on('loopStop', () => {
    isMerge = false;
    selectBtn.style.opacity = 1;
    followersBtn.disabled = false;
    skillsBtn.disabled = false;
    eventLog.innerHTML = twitterName + 'はどうする?';
});

// 行動決定ボタンを押下した時に発火する関数
const enterAction = (e) => {
    const enterBtnDataset = enterBtn.dataset;
    const selected = document.getElementsByClassName('selected');
    const skillsToggle = document.getElementsByClassName('skillsShowToggle');
    const followersToggle = document.getElementsByClassName('followersShowToggle');
    skillsToggle.length ? skillsToggle[0].classList.remove('skillsShowToggle') : followersToggle[0].classList.remove('followersShowToggle');
    selected[0].classList.remove('selected');
    enterBtn.disabled = true;
    enterBtn.style.backgroundColor = '#a8a8a8';
    enterBtn.style.display = 'none';
    selectBtn.style.opacity = 0.2;
    followersBtn.disabled = true;
    skillsBtn.disabled = true;
    if (window.getComputedStyle(myFollower).getPropertyValue('opacity') != '0') {
        isMerge = false;
        eventLog.textContent = '相手の操作を待機中...';
        socket.emit('waiting', {
            dataset: enterBtnDataset,
            rate,
            roomID
        });
    } else {
        changeMyFollower(enterBtnDataset.name, enterBtnDataset.image, enterBtnDataset.type, enterBtnDataset.hp, enterBtnDataset.maxhp, enterBtnDataset.follower, enterBtnDataset.attack, enterBtnDataset.defense, true);
    }
};

// 戦闘中フォロワーの現在のHPを「フォロワー」一覧に反映させる関数
const currentHP = () => {
    const currentFollowerNum = myFollower.dataset.follower;
    const currentFollowerHP = currentFollowerNum + 'HP';
    const currentFollower = document.getElementById(currentFollowerNum);
    document.getElementById(currentFollowerHP).textContent = myHP.textContent;
    currentFollower.firstChild.nextSibling.dataset.hp = myHP.textContent;
};

// 互いの行動が確定した際の処理------------------------------------------------------------------------------------------------------------------
// 自分・相手のフォロワー交換処理関数
const changeMyFollower = async (name, icon, type, hp, maxhp, follower, attack, defense, died) => {
    eventLog.innerHTML = myName.textContent + 'を戻した!<br>いけ! ' + name + '!';
    currentHP();
    myName.textContent = name;
    myIcon.setAttribute('src', icon);
    myType.textContent = type;
    myHP.textContent = hp;
    myMaxHP.textContent = maxhp;
    myFollower.dataset.follower = follower;
    myFollower.dataset.followerattack = attack;
    myFollower.dataset.followerdefense = defense;
    remainingMyHP.style.width = (myHPGauge.clientWidth * (Number(myHP.textContent) / Number(myMaxHP.textContent))) + 'px';
    followerKey = follower;
    selectBtn.dataset.follower = follower;
    myFollower.style.opacity = 1;
    await setTimeOut();
    if (died === true) {
        socket.emit('followerChangeDueToDied', {
            roomID,
            enemyName: name,
            enemyIcon: icon,
            enemyType: type,
            enemyHP: hp,
            enemyMaxHP: maxhp,
            enemyAttack: attack,
            enemyDefense: defense
        });
    }
};
const changeEnemyFollower = async (name, icon, type, hp, maxhp, attack, defense) => {
    eventLog.innerHTML = '相手は' + enemyName.textContent + 'を戻して<br>' + name + 'をくりだした!';
    enemyName.textContent = name;
    enemyIcon.setAttribute('src', icon);
    enemyType.textContent = type;
    enemyHP.textContent = hp;
    enemyMaxHP.textContent = maxhp;
    enemyFollower.dataset.enemyattack = attack;
    enemyFollower.dataset.enemydefense = defense;
    remainingEnemyHP.style.width = (enemyHPGauge.clientWidth * (Number(enemyHP.textContent) / Number(enemyMaxHP.textContent))) + 'px';
    enemyFollower.style.opacity = 1;
    await setTimeOut();
};

// 命中処理関数
const hit = (accuracy) => {
    const accuracyNum = Number(accuracy);
    const hitRate = Math.floor(Math.random() * (101 - 1)) + 1;
    if (hitRate <= accuracyNum) {
        return true;
    } else {
        return false;
    }
};
// こうげきが当たらなかった場合のイベントログ
const missLog = async (name) => {
    eventLog.innerHTML = name + 'のこうげき!';
    await setTimeOut();
    eventLog.innerHTML = 'しかし ' + name + ' のこうげきは外れてしまった!';
};
// ダメージ計算関数
const damageCalculation = (followerAttack, skillAttack, enemyDefense, isSameType, weakType, randomNum) => {
    const damage = Math.floor( (12 * followerAttack * skillAttack * isSameType * weakType * randomNum) / (enemyDefense * 50) );
    return damage;
};
// タイプ相性確認関数
const attackDamage = async (attackerName, attackerType, defenderType, attackerAttack, defenderDefense, tweet, skilltype, skillattack, randomNum) => {
    const isSameType = (attackerType === skilltype) ? 1.5 : 1;
    const weakType = () => {
        const weakTypeCompatibilityKeys = Object.keys(weakTypeCompatibility);
        const strongTypeCompatibilityKeys = Object.keys(strongTypeCompatibility);
        for (const key of weakTypeCompatibilityKeys) {
            if (key === skilltype && weakTypeCompatibility[key] === defenderType) {
                return 2;
            }
        };
        for (const key of strongTypeCompatibilityKeys) {
            if (key === skilltype && strongTypeCompatibility[key] === defenderType) {
                return 0.5;
            }
        };
        return 1;
    };
    if (weakType() === 2) {
        eventLog.innerHTML = attackerName + ' の ' + tweet + ' こうげき!<br>効果は抜群だ!';
    } else if (weakType() === 0.5) {
        eventLog.innerHTML = attackerName + ' の ' + tweet + ' こうげき!<br>効果はいまひとつのようだ...';
    } else {
        eventLog.innerHTML = attackerName + ' の ' + tweet + ' こうげき!';
    }
    await setTimeOut();
    const attack = Number(attackerAttack);
    const defense = Number(defenderDefense);
    const damage = damageCalculation(attack, Number(skillattack), defense, isSameType, weakType(), randomNum);
    return damage;
};

// ダメージを画面に反映させる関数
const reflectDamage = (damage, hp, maxhp, hpGauge, remainingHP) => {
    const afterHP = Number(hp.textContent) - damage;
    if (afterHP <= 0) {
        hp.textContent = 0;
        currentHP();
        remainingHP.style.width = '0px';
        return false;
    } else {
        hp.textContent = afterHP;
        currentHP();
        const hpGaugeWidth = hpGauge.clientWidth;
        const remainingHPWidth = remainingHP.clientWidth;
        const afterHPGaugeWidth = remainingHPWidth - damage * (Number(hpGaugeWidth) / Number(maxhp));
        remainingHP.style.width = afterHPGaugeWidth + 'px';
        return true;
    }
};

// こうげきをしてHPが0になった時の処理
const dying = async (dyingFollower, follower, killed, enemyRate) => {
    const diedFollower = follower.dataset.follower ? follower.dataset.follower : undefined;
    const diedFollowerElement = document.getElementById(diedFollower);
    eventLog.innerHTML = dyingFollower + ' は倒れた!';
    await setTimeOut();
    follower.style.opacity = 0;
    await setTimeOut();
    selectBtn.style.opacity = 0.2;
    followersBtn.disabled = true;
    skillsBtn.disabled = true;
    // 倒されたフォロワーが自分か相手か判別して処理
    if (!killed) {
        defeatNum++;
        if (defeatNum === 3) {
            const result = winnerRate(rate, enemyRate);
            eventLog.innerHTML = 'バトルに勝利した!!<br><br>レーティング: ' + rate + ' → ' + result + '(+' + (result-rate) + ')';
            await setTimeOut();
            await returnHome(result, 'win');
        } else {
            eventLog.innerHTML = '相手の通信待機中...';
        }
    } else {
        // 次に戦闘に出す自分のフォロワーを選ぶ画面を表示
        dyingNum++;
        if (dyingNum === 3) {
            const result = loserRate(rate, enemyRate);
            eventLog.innerHTML = 'バトルに敗北した...<br><br>レーティング: ' + rate + ' → ' + result + '(-' + (rate-result) + ')';
            await setTimeOut();
            await returnHome(result, 'lose');
        } else {
            eventLog.innerHTML = '次に戦わせるフォロワーを選んでください';
            enterBtn.style.display = 'block';
            diedFollowerElement.style.backgroundColor = '#C0C0C0';
            diedFollowerElement.firstChild.nextSibling.dataset.containertype = 'died';
            followersElement.classList.toggle('followersShowToggle');
            actionContainer.style.marginTop = window.getComputedStyle(fixedScreen).getPropertyValue('height');
        }
    }
};

// レーティング計算
const winnerRate = (myRate, enemyRate) => {
    const difference = Math.abs(myRate-enemyRate);
    const threshold = 16;
    const newRate = rate + threshold;
    return newRate;
};
const loserRate = (myRate, enemyRate) => {
    const difference = Math.abs(myRate-enemyRate);
    const threshold = 16;
    const newRate = rate - threshold;
    return newRate;
};

// 行動開始socket
socket.on('actionStart', async (data) => {
    const myDataset = enterBtn.dataset;
    const enemyDataset = data.dataset;
    const alreadyMyHitJudge = data.myHitJudge;
    const alreadyEnemyHitJudge = data.enemyHitJudge;
    const damageCalculated = (alreadyMyHitJudge != undefined  || alreadyEnemyHitJudge != undefined) ? true : false;
    // 互いの行動がフォロワー入れ替えかこうげきか判別して行動の優先順位をつける
    if (myDataset.containertype === 'follower') {
        if (enemyDataset.containertype === 'follower') {
            priority = (Number(myDataset.hp) > Number(enemyDataset.hp)) ? true : false;
            if (priority === true) {
                // 双方フォロワー交換 -> 先攻
                await changeMyFollower(
                    myDataset.name,
                    myDataset.image,
                    myDataset.type,
                    myDataset.hp,
                    myDataset.maxhp,
                    myDataset.follower,
                    myDataset.attack,
                    myDataset.defense
                );
                await changeEnemyFollower(
                    enemyDataset.name,
                    enemyDataset.image,
                    enemyDataset.type,
                    enemyDataset.hp,
                    enemyDataset.maxhp,
                    enemyDataset.attack,
                    enemyDataset.defense
                );
                socket.emit('checkProcessed', {
                    myDataset,
                    roomID
                });
            } else {
                // 双方フォロワー交換 -> 後攻
                await changeEnemyFollower(
                    enemyDataset.name,
                    enemyDataset.image,
                    enemyDataset.type,
                    enemyDataset.hp,
                    enemyDataset.maxhp,
                    enemyDataset.attack,
                    enemyDataset.defense
                );
                await changeMyFollower(
                    myDataset.name,
                    myDataset.image,
                    myDataset.type,
                    myDataset.hp,
                    myDataset.maxhp,
                    myDataset.follower,
                    myDataset.attack,
                    myDataset.defense
                );
                socket.emit('checkProcessed', {
                    myDataset,
                    roomID
                });
            }
        } else if (enemyDataset.containertype === 'skill') {
            // フォロワー交換：こうげき -> 先攻
            if (!damageCalculated) {
                const myHitJudge = hit(myDataset.accuracy);
                const enemyHitJudge = hit(enemyDataset.accuracy);
                const myRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                const enemyRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                await changeMyFollower(
                    myDataset.name,
                    myDataset.image,
                    myDataset.type,
                    myDataset.hp,
                    myDataset.maxhp,
                    myDataset.follower,
                    myDataset.attack,
                    myDataset.defense
                );
                await setTimeOut();
                if (enemyHitJudge === true) {
                    const damageReceived = await attackDamage(
                        enemyName.textContent,
                        enemyType.textContent,
                        myType.textContent,
                        enemyFollower.dataset.enemyattack,
                        myFollower.dataset.followerdefense,
                        enemyDataset.tweet,
                        enemyDataset.type,
                        enemyDataset.attack,
                        enemyRandomNum
                    );
                    const reflect = await reflectDamage(damageReceived, myHP, myMaxHP.textContent, myHPGauge, remainingMyHP);
                    if (reflect === false) {
                        // 自分のHPが0になった側のフォロワー入れ替えへ移行
                        const killed = true;
                        dying(myName.textContent, myFollower, killed, data.enemyRate);
                        socket.emit('checkProcessed', {
                            myDataset,
                            myHitJudge,
                            enemyHitJudge,
                            myRandomNum,
                            enemyRandomNum,
                            rate,
                            roomID
                        });
                        return
                    }
                } else {
                    await missLog(enemyName.textContent);
                }
                socket.emit('checkProcessed', {
                    myDataset,
                    myHitJudge,
                    enemyHitJudge,
                    myRandomNum,
                    enemyRandomNum,
                    roomID
                });
            } else {
                await changeMyFollower(
                    myDataset.name,
                    myDataset.image,
                    myDataset.type,
                    myDataset.hp,
                    myDataset.maxhp,
                    myDataset.follower,
                    myDataset.attack,
                    myDataset.defense
                );
                await setTimeOut();
                if (alreadyEnemyHitJudge === true) {
                    const damageReceived = await attackDamage(
                        enemyName.textContent,
                        enemyType.textContent,
                        myType.textContent,
                        enemyFollower.dataset.enemyattack,
                        myFollower.dataset.followerdefense,
                        enemyDataset.tweet,
                        enemyDataset.type,
                        enemyDataset.attack,
                        data.enemyRandomNum
                    );
                    const reflect = await reflectDamage(damageReceived, myHP, myMaxHP.textContent, myHPGauge, remainingMyHP);
                    if (reflect === false) {
                        // socketでHP0になった側のフォロワー入れ替えへ移行
                        const killed = true;
                        dying(myName.textContent, myFollower, killed, data.enemyRate);
                        socket.emit('checkProcessed', {
                            myDataset,
                            myHitJudge,
                            enemyHitJudge,
                            myRandomNum,
                            enemyRandomNum,
                            priority,
                            rate,
                            roomID
                        });
                        return
                    }
                } else {
                    await missLog(enemyName.textContent);
                }
                socket.emit('checkProcessed', {
                    myDataset,
                    roomID
                });
            }
        }
    } else if (myDataset.containertype === 'skill') {
        if (enemyDataset.containertype === 'follower') {
            // フォロワー交換：こうげき -> 後攻
            if (!damageCalculated) {
                const myHitJudge = hit(myDataset.accuracy);
                const enemyHitJudge = hit(enemyDataset.accuracy);
                const myRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                const enemyRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                await changeEnemyFollower(
                    enemyDataset.name,
                    enemyDataset.image,
                    enemyDataset.type,
                    enemyDataset.hp,
                    enemyDataset.maxhp,
                    enemyDataset.attack,
                    enemyDataset.defense
                );
                setTimeOut();
                if (myHitJudge === true) {
                    const damageDone = await attackDamage(
                        myName.textContent,
                        myType.textContent,
                        enemyType.textContent,
                        myFollower.dataset.followerattack,
                        enemyFollower.dataset.enemydefense,
                        myDataset.tweet,
                        myDataset.type,
                        myDataset.attack,
                        myRandomNum
                    );
                    const reflect = await reflectDamage(damageDone, enemyHP, enemyMaxHP.textContent, enemyHPGauge, remainingEnemyHP);
                    if (reflect === false) {
                        const killed = false;
                        dying(enemyName.textContent, enemyFollower, killed, data.enemyRate);
                        socket.emit('checkProcessed', {
                            myDataset,
                            myHitJudge,
                            enemyHitJudge,
                            myRandomNum,
                            enemyRandomNum,
                            rate,
                            roomID
                        });
                        return
                    }
                } else {
                    await missLog(myName.textContent);
                }
                socket.emit('checkProcessed', {
                    myDataset,
                    myHitJudge,
                    enemyHitJudge,
                    myRandomNum,
                    enemyRandomNum,
                    roomID
                });
            } else {
                await changeEnemyFollower(
                    enemyDataset.name,
                    enemyDataset.image,
                    enemyDataset.type,
                    enemyDataset.hp,
                    enemyDataset.maxhp,
                    enemyDataset.attack,
                    enemyDataset.defense
                );
                await setTimeOut();
                if (alreadyMyHitJudge === true) {
                    const damageDone = await attackDamage(
                        myName.textContent,
                        myType.textContent,
                        enemyType.textContent,
                        myFollower.dataset.followerattack,
                        enemyFollower.dataset.enemydefense,
                        myDataset.tweet,
                        myDataset.type,
                        myDataset.attack,
                        data.myRandomNum
                    );
                    const reflect = await reflectDamage(damageDone, enemyHP, enemyMaxHP.textContent, enemyHPGauge, remainingEnemyHP);
                    if (reflect === false) {
                        // socketでHP0になった側のフォロワー入れ替えへ移行
                        const killed = false;
                        dying(enemyName.textContent, enemyFollower, killed, data.enemyRate);
                        socket.emit('checkProcessed', {
                            myDataset,
                            myHitJudge,
                            enemyHitJudge,
                            myRandomNum,
                            enemyRandomNum,
                            rate,
                            roomID
                        });
                        return
                    }
                } else {
                    await missLog(myName.textContent);
                }
                socket.emit('checkProcessed', {
                    myDataset,
                    roomID
                });
            }
        } else if (enemyDataset.containertype === 'skill') {
            if (data.priority === undefined) {
                if (Number(myDataset.speed) >= Number(enemyDataset.speed)) {
                    priority = true;
                } else {
                    priority = false;
                }
            } else {
                priority = data.priority;
                priority = !priority;
            }
            if (priority === true) {
                // 双方こうげき -> 先攻
                if (!damageCalculated) {
                    const myHitJudge = hit(myDataset.accuracy);
                    const enemyHitJudge = hit(enemyDataset.accuracy);
                    const myRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                    const enemyRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                    if (myHitJudge === true) {
                        const damageDone = await attackDamage(
                            myName.textContent,
                            myType.textContent,
                            enemyType.textContent,
                            myFollower.dataset.followerattack,
                            enemyFollower.dataset.enemydefense,
                            myDataset.tweet,
                            myDataset.type,
                            myDataset.attack,
                            myRandomNum
                        );
                        const reflect = await reflectDamage(damageDone, enemyHP, enemyMaxHP.textContent, enemyHPGauge, remainingEnemyHP);
                        if (reflect === false) {
                            // 相手のHPが0になった側のフォロワー入れ替えへ移行
                            const killed = false;
                            dying(enemyName.textContent, enemyFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(myName.textContent);
                    }
                    await setTimeOut();
                    if (enemyHitJudge === true) {
                        const damageReceived = await attackDamage(
                            enemyName.textContent,
                            enemyType.textContent,
                            myType.textContent,
                            enemyFollower.dataset.enemyattack,
                            myFollower.dataset.followerdefense,
                            enemyDataset.tweet,
                            enemyDataset.type,
                            enemyDataset.attack,
                            enemyRandomNum
                        );
                        const reflect = await reflectDamage(damageReceived, myHP, myMaxHP.textContent, myHPGauge, remainingMyHP);
                        if (reflect === false) {
                            // 自分のHPが0になった側のフォロワー入れ替えへ移行
                            const killed = true;
                            dying(myName.textContent, myFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(enemyName.textContent);
                    }
                    socket.emit('checkProcessed', {
                        myDataset,
                        myHitJudge,
                        enemyHitJudge,
                        myRandomNum,
                        enemyRandomNum,
                        priority,
                        roomID
                    });
                } else {
                    if (alreadyMyHitJudge === true) {
                        const damageDone = await attackDamage(
                            myName.textContent,
                            myType.textContent,
                            enemyType.textContent,
                            myFollower.dataset.followerattack,
                            enemyFollower.dataset.enemydefense,
                            myDataset.tweet,
                            myDataset.type,
                            myDataset.attack,
                            data.myRandomNum
                        );
                        const reflect = await reflectDamage(damageDone, enemyHP, enemyMaxHP.textContent, enemyHPGauge, remainingEnemyHP);
                        if (reflect === false) {
                            // socketでHP0になった側のフォロワー入れ替えへ移行
                            const killed = false;
                            dying(enemyName.textContent, enemyFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(myName.textContent);
                    }
                    await setTimeOut();
                    if (alreadyEnemyHitJudge === true) {
                        const damageReceived = await attackDamage(
                            enemyName.textContent,
                            enemyType.textContent,
                            myType.textContent,
                            enemyFollower.dataset.enemyattack,
                            myFollower.dataset.followerdefense,
                            enemyDataset.tweet,
                            enemyDataset.type,
                            enemyDataset.attack,
                            data.enemyRandomNum
                        );
                        const reflect = await reflectDamage(damageReceived, myHP, myMaxHP.textContent, myHPGauge, remainingMyHP);
                        if (reflect === false) {
                            // socketでHP0になった側のフォロワー入れ替えへ移行
                            const killed = true;
                            dying(myName.textContent, myFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(enemyName.textContent);
                    }
                    socket.emit('checkProcessed', {
                        myDataset,
                        roomID
                    });
                }
            } else {
                // 双方こうげき -> 後攻
                if (!damageCalculated) {
                    const myHitJudge = hit(myDataset.accuracy);
                    const enemyHitJudge = hit(enemyDataset.accuracy);
                    const myRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                    const enemyRandomNum = (Math.floor(Math.random() * (100 - 85)) + 85) / 100;
                    if (enemyHitJudge === true) {
                        const damageReceived = await attackDamage(
                            enemyName.textContent,
                            enemyType.textContent,
                            myType.textContent,
                            enemyFollower.dataset.enemyattack,
                            myFollower.dataset.followerdefense,
                            enemyDataset.tweet,
                            enemyDataset.type,
                            enemyDataset.attack,
                            enemyRandomNum
                        );
                        const reflect = await reflectDamage(damageReceived, myHP, myMaxHP.textContent, myHPGauge, remainingMyHP);
                        if (reflect === false) {
                            // socketでHP0になった側のフォロワー入れ替えへ移行
                            const killed = true;
                            dying(myName.textContent, myFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(enemyName.textContent);
                    }
                    await setTimeOut();
                    if (myHitJudge === true) {
                        const damageDone = await attackDamage(
                            myName.textContent,
                            myType.textContent,
                            enemyType.textContent,
                            myFollower.dataset.followerattack,
                            enemyFollower.dataset.enemydefense,
                            myDataset.tweet,
                            myDataset.type,
                            myDataset.attack,
                            myRandomNum
                        );
                        const reflect = await reflectDamage(damageDone, enemyHP, enemyMaxHP.textContent, enemyHPGauge, remainingEnemyHP);
                        if (reflect === false) {
                            const killed = false;
                            dying(enemyName.textContent, enemyFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(myName.textContent);
                    }
                    socket.emit('checkProcessed', {
                        myDataset,
                        myHitJudge,
                        enemyHitJudge,
                        myRandomNum,
                        enemyRandomNum,
                        priority,
                        roomID
                    });
                } else {
                    if (alreadyEnemyHitJudge === true) {
                        const damageReceived = await attackDamage(
                            enemyName.textContent,
                            enemyType.textContent,
                            myType.textContent,
                            enemyFollower.dataset.enemyattack,
                            myFollower.dataset.followerdefense,
                            enemyDataset.tweet,
                            enemyDataset.type,
                            enemyDataset.attack,
                            data.enemyRandomNum
                        );
                        const reflect = await reflectDamage(damageReceived, myHP, myMaxHP.textContent, myHPGauge, remainingMyHP);
                        if (reflect === false) {
                            // socketでHP0になった側のフォロワー入れ替えへ移行
                            const killed = true;
                            dying(myName.textContent, myFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(enemyName.textContent);
                    }
                    await setTimeOut();
                    if (alreadyMyHitJudge === true) {
                        const damageDone = await attackDamage(
                            myName.textContent,
                            myType.textContent,
                            enemyType.textContent,
                            myFollower.dataset.followerattack,
                            enemyFollower.dataset.enemydefense,
                            myDataset.tweet,
                            myDataset.type,
                            myDataset.attack,
                            data.myRandomNum
                        );
                        const reflect = await reflectDamage(damageDone, enemyHP, enemyMaxHP.textContent, enemyHPGauge, remainingEnemyHP);
                        if (reflect === false) {
                            // socketでHP0になった側のフォロワー入れ替えへ移行
                            const killed = false;
                            dying(enemyName.textContent, enemyFollower, killed, data.enemyRate);
                            socket.emit('checkProcessed', {
                                myDataset,
                                myHitJudge,
                                enemyHitJudge,
                                myRandomNum,
                                enemyRandomNum,
                                priority,
                                rate,
                                roomID
                            });
                            return
                        }
                    } else {
                        await missLog(myName.textContent);
                    }
                    socket.emit('checkProcessed', {
                        myDataset,
                        roomID
                    });
                }
            }
        }
    }
});

// 1ターンの最後の処理、ループ解除
socket.on('actionEnd', async () => {
    if (isMerge === true) {
        eventLog.innerHTML = twitterName + ' はどうする?';
        return
    } else {
        isMerge = true;
        selectBtn.style.opacity = 1;
        followersBtn.disabled = false;
        skillsBtn.disabled = false;
        eventLog.innerHTML = twitterName + ' はどうする?';
        socket.emit('enemyActionEnd', {
            roomID
        });
    }
});

// 相手フォロワーを倒した場合の処理
socket.on('diedEnemyFollower', async (data) => {
    await changeEnemyFollower(data.enemyName, data.enemyIcon, data.enemyType, data.enemyHP, data.enemyMaxHP, data.enemyAttack, data.enemyDefense);
    socket.emit('enemyActionEnd', {
        roomID
    });
});

// クリックイベント
followersBtn.addEventListener('click', followersShowToggle, false);
skillsBtn.addEventListener('click', skillsShowToggle, false);
actionContainer.addEventListener('click', selectAction, false);
enterBtn.addEventListener('click', enterAction, false);
