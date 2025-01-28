const backButton = document.getElementById('backBtn')
const blank = document.getElementById('blank')
//var test = 0;

backButton.addEventListener('click', () => {
    window.mainConnector.toSettings()
})

function populateFriendRequests(newRequest) {
  var table = document.getElementById("friendName");
  var row = table.insertRow(0);
  var cell1 = row.insertCell(0);
  cell1.classList.add("friendsName")
  cell1.innerHTML = newRequest; // this needs to be the name of the friend you have!
}

function testFunction() {
  var table = document.getElementById("friendName");
  var row = table.insertRow(0);
  var cell1 = row.insertCell(0);
  cell1.classList.add("friendsName")
  if(blank) {
    blank.remove();
  }
  //test = test + 1;
  cell1.innerHTML = "Hey";
}
