const fs  = require('fs')
const files = {}

const socketIoSetup = (socket) => {

  /**
   * Handle socker.io Start event
   **/
  socket.on('Start', function (data) {
    console.log('Socket received - Start')
    var name = data['name']
    files[name] = {
      fileSize : data['size'],
      data   : "",
      downloaded : 0
    }

    var place = 0
    try {
      var stat = fs.statSync('Temp/' +  name)
      if(stat.isFile()) {
        files[name]['downloaded'] = stat.size
        place = stat.size / 524288
      }
    }
    catch(er){
      // console.error('Error in stat block: ', er)
    }

    fs.open("Temp/" + name, "a", 0755, function(err, fd) {
      // if(err) {
      //   console.log('Open error: ', err)
      // } else {
        console.log('File was opened, sending MoreData')
        files[name]['handler'] = fd
        socket.emit('MoreData', { 'Place' : place, percent : 0 })
      // }
    })
  })

  /**
   * Handle socket.io Upload event
   */
  socket.on('Upload', function (data) {
    console.log('Socket received - Upload')

    var name = data['name']
    files[name]['downloaded'] += data['data'].length
    files[name]['data'] += data['data']

    // If File is Fully Uploaded
    if (files[name]['downloaded'] == files[name]['fileSize']) {
      console.log('File was fully uploaded')
      fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', (err, Writen) => {
        generateThumbNail(name)
      })
    } else if (files[name]['data'].length > 10485760) { // If the Data Buffer reaches 10MB
      console.log('Write file buffer to disk')
      fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', (err, Writen) => {
        files[name]['data'] = "" // Reset The Buffer
        var place = files[name]['downloaded'] / 524288
        var percent = (files[name]['downloaded'] / files[name]['nileSize']) * 100
        socket.emit('MoreData', { 'place' : place, 'percent' :  percent})
      })
    } else {
      console.log('Asking for more data')
      var place = files[name]['downloaded'] / 524288
      var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100
      socket.emit('MoreData', { 'place' : place, 'percent' :  percent})
    }
  })

  function generateThumbNail(name) {
    console.log('In generateThumbNail()')
    var inp = fs.createReadStream("Temp/" + name)
    var out = fs.createWriteStream("FastQs/" + name)
  
    inp.pipe(out)
    inp.on('end', () => {
      // Delete The Temporary File
      fs.unlink("Temp/" + name, function () {
        socket.emit('Done', {'image' : 'FastQs/' + name})
      })
    })
  }
}

module.exports = {
  socketIoSetup: socketIoSetup
}