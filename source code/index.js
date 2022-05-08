require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const socketio = require('socket.io')
const app = express()

app.set('view engine', 'ejs')
app.set("views", "./views");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}))

app.get('/login', (req, res)=>{
	res.render('login',{error:''})
})

app.get('/index', (req, res)=>{
	res.render('index')
})

app.post('/login', (req, res)=>{
	let acc = req.body
	let error = ''
	if (!acc.username){
		error = "Vui lòng nhập username"
	}
	if (error.length>0){
		res.render("login", {error})
	}
	else{
		res.redirect("/index")
	}
})

app.use((req, res)=>{
	res.redirect('/login')
});

const PORT = process.env.PORT || 8080
const httpServer = app.listen(PORT, ()=> console.log('http://localhost:'+PORT))
const io = socketio(httpServer)

io.on('connection', socket =>{
	console.log(`socket ${socket.id} connected`)

	socket.loginAt = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit',
	minute:'2-digit', hour12: true})

	let users = Array.from(io.sockets.sockets.values())
						.map(socket =>({id: socket.id,
										username: socket.username,
										loginAt: socket.loginAt
						}))
	console.log(users)

	socket.on('disconnect', () => {
		console.log(`socket ${socket.id} disconnected`)
		socket.broadcast.emit('user-leave', socket.id)
	})	

	// socket.on('message', m =>{
	// 	console.log(`Message from socket with id ${socket.id} is: ${m}`)
	// })
	// socket.send('The message was sent from server')

	socket.on('register-name', username =>{
		socket.username = username
		console.log(username)
		socket.broadcast.emit('register-name', {
								id: socket.id,
								username: username 
							})
	})

	socket.emit('list-users', users)

	socket.broadcast.emit('new-user', {id: socket.id, username: socket.username, loginAt: socket.loginAt})

	socket.on("client-send-message", function(data){
		let sendAt = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit',
		minute:'2-digit', hour12: true})
		io.sockets.emit("server-send-message",{id: socket.id, username: socket.username, message: data, sendAt:sendAt})
	})
})