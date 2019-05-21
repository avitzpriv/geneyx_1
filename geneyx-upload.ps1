write-host('Starting uploader ...')

$runs = 1
while ( $runs -lt 11) {
  $msg = 'Run number: ' + $runs
  write-host('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  write-host($msg)
  write-host('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  add-content .\runs.log $msg
  
  $runs += 1
  node .\helpers\jobsRunnerHelper.js
}

write-host('Uploader done')