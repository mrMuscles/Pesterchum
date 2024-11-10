const loginButton = document.getElementById('loginBtn')
const registerButton = document.getElementById('registerBtn')

loginButton.addEventListener('click', () => {
    const email = document.getElementById("email").value
    const pass = document.getElementById('password').value
    window.mainConnector.loginCheck(email, pass)
})

registerButton.addEventListener('click', () => {
  window.mainConnector.toRegister()
})
