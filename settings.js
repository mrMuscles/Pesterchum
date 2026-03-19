const backButton = document.getElementById('backBtn')
const friendButton = document.getElementById('friendBtn')
const pendingButton = document.getElementById('pendingList')
const flist = document.getElementById('friendList')
const addButton = document.getElementById('addBtn')
flist.style.display = "none";

backButton.addEventListener('click', () => {
    window.mainConnector.toMain()
})

friendButton.addEventListener('click', () => {
    flist.style.display = "block";
})

pendingButton.addEventListener('click', () => {
    window.mainConnector.toPending()
})

addButton.addEventListener('click', () => {
    const email = document.getElementById("friendEmail").value
    window.mainConnector.addFriend(email)
})

function populateFriendsList(friends) {
    const table = document.getElementById("friendName");
    const blankCell = document.getElementById("blank");
    if (friends && friends.length > 0) {
        if (blankCell) {
            blankCell.remove();
        }
        friends.forEach(function(friend) {
            const row = table.insertRow(-1);
            const cell1 = row.insertCell(0);
            cell1.classList.add("friendsName");
            cell1.innerHTML = friend;
        });
    }
}

function addNewFriend(username) {
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

window.mainConnector.onReceiveFriendsList((friends) => {
    populateFriendsList(friends);
});

window.mainConnector.onReceiveNewFriend((username) => {
    addNewFriend(username);
});
