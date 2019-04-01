

const windowReady = () => {

  /** The clear button */
  const clearBtn = document.getElementById('clearSearch')
  clearBtn.addEventListener('click', () => {
    document.getElementById("searchForm").reset();
  })

  /** The progress bar */
  fetch('/jobs/progress_bar')
    .then( response => {
      return response.json()
    })
    .then( json => {
      console.log('Request successful', json)
      const done = json['done'] !== undefined ? parseInt(json['done']) : 0
      const ready = json['ready'] !== undefined ? parseInt(json['ready']) : 0
      const running = json['running'] !== undefined ? parseInt(json['running']) : 0
      const rerun = json['rerun'] !== undefined ? parseInt(json['rerun']) : 0
      const error = json['error'] !== undefined ? parseInt(json['error']) : 0
      const pb = document.getElementById('progressBar')

      let displayMsg
      if (error > 0) {
        displayMsg = 'Job has errors'
      } else {
        if (ready + done + running + rerun === 0) {
          displayMsg = 'All done'
        } else {
          displayMsg = `${done} out of ${ready + done + running + rerun}`
        }
        
      }
      pb.innerText = displayMsg

    })
    .catch( error => {
      console.error('Request failed', error)
    })
}

window.addEventListener("load", windowReady)
