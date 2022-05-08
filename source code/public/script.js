let socket;
let username;
let onlineUsers = []

$(window).ready(function(){
  console.log('Open connect to server')

  socket = io();
  socket.on('connect', handleConnectionSuccess)

  socket.on('disconnect', ()=>{
    console.log('disconnected')
  })

  socket.on('error', (e)=>{
    console.log('Error' + e.message)
  })

  /*  
  socket.on('message', (m)=>{
    console.log(`Message from server: ${m}`)

    socket.send(m.toUpperCase())
  }) */

  socket.on('list-users', handleUserList)
  socket.on('new-user', handleNewUser)
  socket.on('user-leave', handleUserLeave)
  socket.on('register-name', handleRegisterUserName)

  $("#btn-send-message").click(function(e){
    e.preventDefault();
    if($("#et-message").val() !== ''){
      socket.emit("client-send-message", $("#et-message").val())
    }
    $("#et-message").val("")
  })

  socket.on('server-send-message', function(data){
    
    let htmlMSG;
    if (data.id == socket.id){
      htmlMSG = `
      <div class="message my-message">${data.message}
        <span class="time">${data.sendAt}</span>
      </div>
      `
    }
    else{
      htmlMSG = `
      <div class="message-container">
        <span class="mess-name">${data.username}</span>
        <div class="message their-message">${data.message}
          <span class="time">${data.sendAt}</span>
        </div>
      </div>
      `
    }
    
    $(".conversation").append(htmlMSG)
  })
})

function handleConnectionSuccess(){
  console.log(socket.id + 'connected successful')
  username = sessionStorage.getItem('username')
  if (username){
    console.log(`username from sesstion storage ${username}`)
  }
  if (!username){
    window.location.href = '/login'
    // username = prompt('Enter your name')
    // sessionStorage.setItem('username', username)
  }

  socket.emit('register-name', username)
}

function handleUserList(users){
  console.log("Took user list")
  users.forEach(u =>{
    console.log(u)
    if (u.id !== socket.id){
      onlineUsers.push(u); // add online users
      displayUser(u)
    }
  })
}

function handleNewUser(user){
  console.log("Took new user")

  console.log(user)
  onlineUsers.push(user)
  console.log(`There are ${onlineUsers.length}`)
}

function handleUserLeave(id){
  onlineUsers = onlineUsers.filter(u => u.id != id)
  console.log("Took info of left user")
  console.log(id)
  removeUser(id)
  console.log(`Remain ${onlineUsers.length} users`)
}

function handleRegisterUserName(data){
  let {id, username} = data
  let user = onlineUsers.find(u => u.id == id)

  if (!user){
    return console.log('user not found')
  }

  user.username = username
  console.log(`Client ${id} registed name: ${username} `)

  displayUser(user)
}

function displayUser(user){
  let userDiv = $(`
  <div id=${user.id} class="user">
        <div class="avatar">${user.username[0]}</div>
        <div class="user-info">
          <div class="user-name">${user.username}</div>
          <div class="online">Truy cập lúc: ${user.loginAt}</div>
        </div>
      </div>
  `)

  $('#user-list').append(userDiv)
  $('#online-count').html($('#user-list .user').length)
}

function removeUser(id){
  $(`#${id}`).remove();
  $('#online-count').html($('#user-list .user').length)
}