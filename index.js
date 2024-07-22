console.log("apn teyar hai")
require('dotenv').config()
const express =require('express')
const App=express()
const http=require('http')
const socket=require('socket.io')
const {Chess}=require('chess.js')
const path = require('path')




const server=http.createServer(App)
const io=socket(server)

App.set("view engine","ejs")
App.use(express.static(path.join(__dirname,"public")))

App.get('/',(req,res)=>{
  res.render("index")
})
App.get('/api/joke',(req,res)=>{
  res.send('sab chal raha hai')
})

const chess=new Chess();
let players={};
let currentPlayer='w';

io.on("connection",function (uniqueSocket){
  console.log('connected')

if(!players.white){
  players.white=uniqueSocket.id;
  uniqueSocket.emit("playerRole","w");
}
else if(!players.black){
  players.black=uniqueSocket.id;
  uniqueSocket.emit("playerRole","b");
}
else{
  uniqueSocket('spectatorRole')
}



  uniqueSocket.on("disconnect", function() {
if(uniqueSocket.id===players.white){
  delete players.white
}
else if(uniqueSocket.id===players.black){
  delete players.black
}

  })

  uniqueSocket.on("move",(move)=>{
    try {
      if(chess.turn()==="w" && uniqueSocket.id !== players.white) return;
      if(chess.turn()==="b" && uniqueSocket.id !== players.black) return;
      const result=chess.move(move);
      if(result){
        currentPlayer=chess.turn()
        io.emit("move",move)
        io.emit("boardState",chess.fen())
      }
      else{
        uniqueSocket.emit("invalidMove",move)
      }
      
    } catch (error) {
      console.log("this is the error",error);
  uniqueSocket.emit("invalidMove",move)
      
    }
  })
})

server.listen(process.env.PORT,()=>{
  console.log(`listening port on the port ${process.env.PORT}`)
})