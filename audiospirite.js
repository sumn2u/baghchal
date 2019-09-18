var audiosprite = require('audiosprite')

var files = ['goatsound.mp3', 'tigersound.wav']
var opts = {output: 'bagchal'}

audiosprite(files, opts, function(err, obj) {
  if (err) return console.error(err)

  console.log(JSON.stringify(obj, null, 2))
})