const APP_LOCALHOST = 'http://localhost'
const APP_PORT = 5000

const socket = io.connect(APP_LOCALHOST + ':' + APP_PORT)
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
    const ownerEmail    = event.target.email.value
    const ownerName     = event.target.name.value
    const labId = window.location.pathname.split('/')[2]

    socket.emit('Start', {
      'name' : name,
      'size' : selectedFile.size,
      'ownerIdentity': ownerIdentity,
      'ownerEmail': ownerEmail,
      'ownerName': ownerName,
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
  document.getElementById('newTestForm').addEventListener('submit', startUpload)
  document.getElementById('fileBox').addEventListener('change', fileChosen)
}
window.addEventListener("load", windowReady)

function updateBar(percent) {
  document.getElementById('progressBar').style.width = percent + '%'
  document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%'
  var mBDone = Math.round(((percent/100.0) * selectedFile.size) / 1048576)
  document.getElementById('MB').innerHTML = mBDone
}

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
