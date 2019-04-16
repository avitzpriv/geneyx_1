
const submitAndSaveJwtToken = (e) => {

  const userName = document.getElementById('loginusername')
  const password = document.getElementById('loginpassword')

  fetch('/authenticate', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({userName: userName.value, password: password.value})
  }).then( (response) => {
    console.log('response: ', response.body)
    return response.json()
  }).then( (data) => {
    console.log('data: ', data)
    if ( data.labid != null && data.labid != undefined ) {
      window.location = `/lab/${data.labid}`
    } else {
      console.log(`ERROR(1) in login: labid not found`)  
    }
  }).catch( (err) => {
    console.log(`ERROR(2) in login: ${err}`)
  })

  e.stopPropagation()
  e.preventDefault()
  return false
}
