const searchRoomID = document.getElementById('searchRoomID');
const searchSubmit = document.getElementById('searchSubmit');
const returnHome = document.getElementById('returnHome');
const referrer = document.referrer;
const referrerArray = referrer.split('/');
const referrerPath = referrerArray[referrerArray.length - 1];
searchSubmit.addEventListener('click', (e) => {
    const searchRoomIDForm = document.createElement('form');
    const roomID = Number(searchRoomID.value);
    searchRoomIDForm.action = '/room/' + roomID;
    searchRoomIDForm.method = 'GET';
    document.body.append(searchRoomIDForm);
    searchRoomIDForm.submit();
});
returnHome.addEventListener('click', (e) => {
    const returnHomeForm = document.createElement('form');
    returnHomeForm.action = '/home';
    returnHomeForm.method = 'GET';
    document.body.append(returnHomeForm);
    returnHomeForm.submit();
});

if (referrerPath.indexOf('home') === -1) {
    alert('対戦部屋IDが間違っています');
}