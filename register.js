const registerButton = document.getElementById('registerBtn')

registerButton.addEventListener('click', () => {
    const email = document.getElementById("email").value
    const pass = document.getElementById('password').value
    const name = document.getElementById('name').value
    window.mainConnector.tryRegister(email, pass, name)
})
