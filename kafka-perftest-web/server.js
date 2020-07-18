const { spawn } = require("child_process")
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const kill  = require('tree-kill')
const fs = require('fs')

io.on('connection', function(socket) {
	console.log('A user connected')

	socket.on('start', function(data) {
		console.log('A user started the kafka test')

		var text = 'kafka-test/bin/kafka-producer-perf-test.sh --topic test --num-records '+data.num+' --record-size '+data.size+' --throughput -1 --producer-props acks=1 bootstrap.servers='+data.host+':9092 buffer.memory=67108864 batch.size=8196'
		fs.writeFile('exec.sh', text, function (err, data) {
		  	if (err) return console.log(err)
		})

		const cmd = spawn("/bin/sh", ["exec.sh"])
		var tempText = ""
		cmd.stdout.on("data", dataCmd => {
			text = `${dataCmd}`
			tempText = tempText + text;	
			if (text.search('max latency') != -1) {
				console.log(tempText)
				var throughput_start = tempText.indexOf('records/sec (')+13
				var throughput_end = tempText.indexOf(' MB/sec')
				var throughput = tempText.substring(throughput_start, throughput_end)

				var latency_start = tempText.indexOf('MB/sec), ')+9
				var latency_end = tempText.indexOf(' ms avg latency')
				var latency = tempText.substring(latency_start, latency_end)

				var latency2_start = tempText.indexOf('sent, ')+6
				var latency2_end = tempText.indexOf(' records/sec')
				var latency2 = tempText.substring(latency2_start, latency2_end)

				var latencyResult = Math.ceil(parseFloat(latency)/parseFloat(latency2))
				console.log(latencyResult)

				console.log('Throughput: '+throughput)
				console.log('Latency: '+latencyResult)

				socket.emit('testerEvent', { 
			    	latency: latencyResult,
			    	throughput: throughput,
			    })

				tempText = ""		
			}    
		})
		cmd.stderr.on("data", data => {
		    console.log(`stderr: ${data}`)
		    socket.emit('testerEvent', { description: `${data}`})
		})
		cmd.on('error', (error) => {
		    console.log(`error: ${error.message}`)
		    socket.emit('testerEvent', { description: `${error}`})
		})
		cmd.on("close", code => {
		    console.log(`child process exited with code ${code}`)
		    socket.emit('testerEvent', { description: `${code}`})
		    socket.emit('stop', {})
		})

		socket.on('stop', function() {
			console.log('A user stopped the kafka test')
			kill(cmd.pid)
		})
		socket.on('disconnect', function () {
			console.log('A user disconnected')
			kill(cmd.pid)
		})
	})
})

app.use(express.static('public'))
app.get('/', function(req, res) {
   	res.sendfile('index.html')
})


http.listen(4000, function() {
	console.log('listening on localhost:4000')
})