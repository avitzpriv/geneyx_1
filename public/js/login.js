
const submitAndSaveJwtToken = (e) => {

  const userName = document.getElementById('loginusername')
  const password = document.getElementById('loginpassword')

  fetch('http://localhost:8080/authenticate', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({userName: userName.value, password: password.value})
  }).then( (response) => {
    return response.json()
  }).then( (data) => {
    window.location = '/lab/4/test'
  }).catch( (err) => {
    console.log(`ERROR in login: ${err}`)
  })

  e.stopPropagation()
  e.preventDefault()
  return false
}