const express=require('express')
const app=express()
const http=require('http')
const server=http.createServer(app)
server.listen(process.env.PORT || 9000,()=>{
    console.log('served')
})
const{Server}=require('socket.io')
const io=new Server(server,{
    cors:{
        origin:[process.env.URL]
    }
})
require('dotenv').config()
const fs=require('fs')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

io.on('connection',(socket)=>{

    socket.on('joinRoom',(data)=>{
        socket.join(data.Room)
    })

    socket.on('message',(data)=>{
        socket.to(data.Room).emit('server',{  
            message:data.message,
            user:data.username,

        })
    })

    socket.on('upload',(data)=>{
        const image=data.imgdata
        fs.writeFile("upload/"+'test.png',image,{encoding:'base64'},(err)=>{
         console.log(err)
        })
        socket.to(data.room).emit('uploaded',{mediadata:String(image),username:data.name})
    })
    socket.on('disconnect',(socket)=>{
        console.log('disconnected')
    })
})

