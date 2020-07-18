const util = require('util');
const { spawn } = require('child_process');
const exec = util.promisify(require('child_process').exec);
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const kill  = require('tree-kill')
const find = require('find-process');
const os = require('os');

io.on('connection', function(socket) {
    console.log('A user connected!')
    socket.emit('connected', {})
    var num = 0

    socket.on('start', function(data) {
        var execute = true
		const ps = spawn('atopsar', ['-d', '-m', '-c', '2', '999999']);     

		ps.stdout.on('data', (data) => {
			text = `${data}`.replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/\s+/g, ' ')
		   	// console.log('ps stdout: ' + text);

		   	cpu_status = text.indexOf('all')
		   	cpu_end = text.indexOf('<br>', cpu_status)
		   	cpu_start = text.lastIndexOf(' ', cpu_end)+1
		   	if (cpu_status != -1) {
		   		cpu = text.substring(cpu_start, cpu_end)
		   		cpu = ( 400 - parseInt(cpu) ) / 4
		   	} else {
		   		cpu = null
		   	}  	

		   	memory_status = text.indexOf('M ')
		   	memory_start = text.indexOf('M ')+1
		   	memory_end = text.indexOf('M', memory_start)	
		   	if (memory_status != -1) {
		   		memory_total = parseInt(os.totalmem()) / 1048576
		   		memory = text.substring(memory_start, memory_end)
		   		memory = memory_total - parseInt(memory)
		   	} else {
		   		memory = null
		   	}

		   	disk_status = text.indexOf('_dsk_')
		   	disk_start = text.indexOf('mmcblk0')+8
		   	disk_end = text.indexOf('%', disk_start)
		   	if (disk_status != -1) {
		   		disk = text.substring(disk_start, disk_end)
		   		if (disk_start == 7) {
		   			disk = 0
		   		}
		   	} else {
		   		disk = null
		   	}

			console.log('CPU: '+cpu)
		   	console.log('Memory: '+memory)
		   	console.log('Disk: '+disk)
		   	console.log(' ')

		   	socket.emit('event', {
		        cpu: cpu,
		        memory: memory,
		        disk: disk,
		    })
		});   

		ps.stderr.on('data', (data) => {
		    console.error(`ps stderr: ${data}`);
		});

		ps.on('close', (code) => {
		    if (code !== 0) {
		        console.log(`ps process exited with code ${code}`);
		    }
		});

		socket.on('stop', function() {
		    console.log('A user stopped the rabbitmq test')
		    execute = false
		    kill(ps.pid)
		})

		socket.on('disconnect', function () {
		    console.log('A user disconnected')
		    execute = false
		    kill(ps.pid)
		})
    })
})

http.listen(3000, function() {
    console.log('listening on localhost:3000')
})