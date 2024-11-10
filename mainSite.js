const settingsButton = document.getElementById('settingsBtn');

window.mainConnector.onReceiveVariable((chumhandle) => {
  document.getElementById('chumhandle').innerText = chumhandle;
});

settingsButton.addEventListener('click', () => {
    window.mainConnector.toSettings()
})
