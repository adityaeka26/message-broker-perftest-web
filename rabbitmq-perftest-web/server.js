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
		console.log('A user started the rabbitmq test')

		var text = './rabbitmq-test/bin/runjava com.rabbitmq.perf.PerfTest --producers '+data.producers+' --consumers '+data.consumers+' --predeclared --routing-key rk --queue q --use-millis -h amqp://'+data.username+':'+data.password+'@'+data.host+' -c 1 -C '+data.num+' --size '+data.size
		fs.writeFile('exec.sh', text, function (err, data) {
		  	if (err) return console.log(err)
		})

		const cmd = spawn("/bin/sh", ["exec.sh"])
		cmd.stdout.on("data", dataCmd => {
		    console.log(`stdout: ${dataCmd}`)

		    var throughput = parseFloat(`${dataCmd}.`.substring(`${dataCmd}`.search('confirmed')+11, `${dataCmd}`.search('msg/s, nacked')-1)) * data.size

			socket.emit('testerEvent', { 
		    	description: `${dataCmd}`,
		    	latency: `${dataCmd}`.substring(`${dataCmd}`.lastIndexOf('/')+1, `${dataCmd}`.lastIndexOf(' ms')),
		    	throughput: throughput,
		    })

		    socket.emit('status', { 
		    	status: 'start',
		    })
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
			console.log('A user stopped the rabbitmq test')
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


http.listen(3000, function() {
	console.log('listening on localhost:3000')
})