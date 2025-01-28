const backButton = document.getElementById('backBtn')
const friendButton = document.getElementById('friendBtn')
const flist = document.getElementById('friendList')
const pending = document.getElementById('pendingList')
const addButton = document.getElementById('addBtn')
const blank = document.getElementById('blank')
flist.style.display = "none";
var test = 0;

backButton.addEventListener('click', () => {
    window.mainConnector.toMain()
})

friendButton.addEventListener('click', () => {
    flist.style.display = "block";
})

pending.addEventListener('click', () => {
    window.mainConnector.toPending()
})

addButton.addEventListener('click', () => {
    const email = document.getElementById("friendEmail").value
    window.mainConnector.addFriend(email)
})

function testFunction() {
  var table = document.getElementById("friendName");
  var row = table.insertRow(0);
  var cell1 = row.insertCell(0);
  cell1.classList.add("friendsName")
  if(blank) {
    blank.remove();
  }
  test = test + 1;
  cell1.innerHTML = "Hey" + test;
}
