const createRoomBtn = document.getElementById('createRoomBtn');
const searchRoomBtn = document.getElementById('searchRoomBtn');
createRoomBtn.addEventListener('click', (e) => {
    const createRoomForm = document.createElement('form');
    const roomID = Math.floor(Math.random() * (999999 - 100000) + 100000);
    createRoomForm.action = '/room/' + roomID;
    createRoomForm.method = 'GET';
    document.body.append(createRoomForm);
    createRoomForm.submit();
});
searchRoomBtn.addEventListener('click', (e) => {
    const searchRoomForm = document.createElement('form');
    searchRoomForm.action = '/search';
    searchRoomForm.method = 'GET';
    document.body.append(searchRoomForm);
    searchRoomForm.submit();
});