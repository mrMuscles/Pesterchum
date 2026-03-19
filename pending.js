const backButton = document.getElementById('backBtn')
const blank = document.getElementById('blank')

backButton.addEventListener('click', () => {
    window.mainConnector.toSettings()
})

function populateFriendRequests(requests) {
    const table = document.getElementById("friendName");
    const blankCell = document.getElementById("blank");
    if (requests && requests.length > 0) {
        if (blankCell) {
            blankCell.remove();
        }
        requests.forEach(function(request) {
            const row = table.insertRow(-1);
            const cell1 = row.insertCell(0);
            cell1.classList.add("friendsName");
            cell1.innerHTML = request;
        });
    }
}

function addNewFriendRequest(username) {
    const table = document.getElementById("friendName");
    const blankCell = document.getElementById("blank");
    if (blankCell) {
        blankCell.remove();
    }
    const row = table.insertRow(-1);
    const cell1 = row.insertCell(0);
    cell1.classList.add("friendsName");
    cell1.innerHTML = username;
}

window.mainConnector.onReceiveFriendRequests((requests) => {
    populateFriendRequests(requests);
});

window.mainConnector.onReceiveNewFriendRequest((username) => {
    addNewFriendRequest(username);
});
