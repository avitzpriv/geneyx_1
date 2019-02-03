let socket = null
let fReader
let selectedFile

function startUpload(event) {
  
  if(document.getElementById('fileBox').value != "") {
    fReader = new FileReader()
    const name = selectedFile.name
    console.log('File name: ', selectedFile)
    var content = "<span id='nameArea'>Uploading " + name + "</span>"
    content += '<div id="progressContainer"><div id="progressBar"></div></div><span id="percent">0%</span>'
    content += "<span id='uploaded'> - <span id='MB'>0</span>/" + Math.round(selectedFile.size / 1048576) + "MB</span>"
    document.getElementById('uploadArea').innerHTML = content
    fReader.onload = function(evnt) {
      socket.emit('Upload', { 'name' : name, data : evnt.target.result })
    }

    const ownerIdentity = event.target.identity.value
    const userEmail    = event.target.email.value
    const userName     = event.target.name.value
    const ownerGender = event.target.gender.value
    const ownerBlood = event.target.blood_type.value
    const ownerBirth = event.target.birth_date.value
    const ownerAdd1 = event.target.property1.value
    const ownerAdd2 = event.target.property2.value
    const labId = window.location.pathname.split('/')[2]

    socket.emit('Start', {
      'name' : name,
      'size' : selectedFile.size,
      'ownerIdentity': ownerIdentity,
      'userEmail': userEmail,
      'userName': userName,
      'ownerGender': ownerGender,
      'ownerBlood': ownerBlood,
      'ownerBirth': ownerBirth,
      'ownerAdd1': ownerAdd1,
      'ownerAdd2' : ownerAdd2,
      'labId': labId
    })
  } else {
    alert("Please Select A File")
  }

  // Important - to make sure the form submits
  console.log('Returning false !!!!!')

  event.preventDefault()
  event.stopPropagation()
  return false
}

function fileChosen(evnt) {
  selectedFile = evnt.target.files[0]
}

/**
 * Register events on DOM objects
 */
function windowReady() {
  console.log('Register for events')
  const appHost = location.host.split(':')[0]
  const appPort = location.port
  const connectionStr = `http://${appHost}:${appPort}`
  socket = io.connect(connectionStr)
  document.getElementById('newTestForm').addEventListener('submit', startUpload)
  document.getElementById('fileBox').addEventListener('change', fileChosen)

  /**
   * Hanlde MoreData event from socket.io
   */
  socket.on('MoreData', function (data) {
    console.log('In Socker.io MoreData')

    updateBar(data['percent'])
    //The Next Blocks Starting Position
    var place = data['place'] * 524288;

    //The Variable that will hold the new Block of Data
    var newFile = selectedFile.slice(place, place + Math.min(524288, (selectedFile.size-place)))
    fReader.readAsBinaryString(newFile)
  })

  /**
   * Hanlde Done event from socket.io
   */
  socket.on('Done', (data) => {
    console.log('In Socker.io Done')
    var content = "File Successfully Uploaded !!"
    content += "<button  type='button' name='upload' value='' id='restart' class='button'>Upload Another</button>"
    document.getElementById('uploadArea').innerHTML = content
    document.getElementById('restart').addEventListener('click', () => {location.reload(true)})
  })
}
window.addEventListener("load", windowReady)

function updateBar(percent) {
  document.getElementById('progressBar').style.width = percent + '%'
  document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%'
  var mBDone = Math.round(((percent/100.0) * selectedFile.size) / 1048576)
  document.getElementById('MB').innerHTML = mBDone
}


