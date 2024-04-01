import React, { useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import { Box,IconButton,OutlinedInput,InputAdornment, Typography} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import styled from '@emotion/styled';

const Comp=styled(Box)`
width:100vw;
height:100vh;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
background:linear-gradient(to right,#E3411F,#0e29be);
@media(max-width:960px){
  padding-top:20px;
  justify-content:start;
}
`
const Headline=styled('span')`
font-size:2.5rem;
@media(max-width:960px){
  font-size:2rem;
}
`
const Comp1=styled(Box)`
width:50vw;
display:flex;
justify-content:start;
color:white;
@media(max-width:960px){
  width:85vw;
}
`
const Comp2=styled(Box)`
width:50vw;
height:70vh;
@media(max-width:960px){
  width:85vw;
  height:80vh;
}
`
const Comp3=styled(Box)`
height:80%;
width:100%;
overflow-y:scroll;
border-radius:5px;
background:lightgrey;
@media(min-width:960px){
  width:80%;
}
`
const Comp4=styled(Box)`
width:100%;
height:13%;
background:white;
display:flex;
justify-content:space-between;
align-items:center;
border-radius:5px;
@media(min-width:960px){
  width:80%;
}
`

function Front() {
  const [socket, setSocket] = useState(null);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [rec, setRec] = useState([]);
  const[room,setRoom]=useState(null)
  const media=useRef()
  
  const setNameAndSocket = () => {
    const user = prompt('Enter Your Name');
    if (user!== null && user!== '') 
    {
      setName(user);
      setSocket(io(process.env.REACT_APP_URL));
    } 
    else 
    {
      setNameAndSocket()
    }
  }

  const setRoomNumber=()=>{
    const roomNo=prompt('Enter Room Number')
    if(roomNo!==null && roomNo!==''){
      setRoom(roomNo)
    }
    else
    {
      setRoomNumber()
    }
  }

  useEffect(()=>{
  setNameAndSocket();
  setRoomNumber();
  },[])

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinRoom',{Room:room})

    socket.on('server',(data) => {
      setRec((rec)=>[...rec,{message:data.message,type:'received',username:data.user,mediatype:'noimg'}]);
    });

    socket.on('uploaded',(data)=>{
      setRec((rec)=>[...rec,{message:data.mediadata,type:'received',username:data.username,mediatype:'image'}]);
    })

  }, [socket]);


  const handleForm = (e) => {
    e.preventDefault();
    if(msg.trim()==='')return
    else
    {
      socket.emit('message', {
        message: msg,
        username:name,
        Room:room,
    });
    setRec((rec)=>[...rec,{message:msg,type:'sent',mediatype:'noimg'}])
    setMsg('');
    }

  };

  const handleMedia=()=>{
    media.current.click()
  }

  const handleSending = (e) => {
    setMsg(e.target.value);
    socket.emit('starttyping',{Room:room});
    setTimeout(()=>{socket.emit('stoptyping',{Room:room})},600)
  };

  const handleInputMedia = (e) => {
    const file=e.target.files[0]
    if(!file)return
    const read=new FileReader()
    read.readAsDataURL(file)
    read.onload=()=>{
      const imgdata=read.result
      socket.emit('upload',{imgdata,room,name})
      setRec((rec)=>[...rec,{message:imgdata,type:'sent',mediatype:'image'}])
    }
  };

  return (
    <Comp>

    <Comp1><Headline>Connect Chat 🤟</Headline></Comp1>

    <Comp2>

    <Box style={{height:'100%',width:'100%',display:'flex',justifyContent:'space-between',flexDirection:'column'}}>

    <Comp3>

    <Box style={{margin:'10px',width:'50%', padding: '10px',background: 'white',wordWrap: 'break-word',borderRadius:'5px'}}>
      <Typography style={{fontSize:'1.2rem'}}>Hi <span style={{color:'skyblue'}}>{name}</span> Enjoy Your Chat 🤘 </Typography>
    </Box>

    { rec.length > 0 
      ? 
      rec.map((val, index) => (
      val.type==='sent'
      ?
      <Box key={index} style={{margin:'10px',width:'50%', padding: '10px',background: 'white',wordWrap: 'break-word',borderRadius:'5px'}}>
       <span style={{color:'red',fontSize:'1.5rem'}}>You</span>
       <br/>
       {val.mediatype==='image'?<img height='100px' width='200px' src={val.message}/>:
       <Typography style={{fontSize:'1.2rem'}}>{val.message}</Typography>
       }
      </Box>
      : 
      <Box key={index} style={{marginLeft:'235px',marginTop:'10px',marginBottom:'10px',width:'50%', padding: '10px',background: 'white',wordWrap: 'break-word',borderRadius:'5px'}}>
       <span style={{color:'green',fontSize:'1.5rem'}}>{val.username}</span>
       <br/>
       {val.mediatype==='image'?<img height='100px' width='200px' src={val.message}/>:
       <Typography style={{fontSize:'1.2rem'}}>{val.message}</Typography>
       }
      </Box>
      ))
      : ''}

    </Comp3>

    <Comp4>
       <OutlinedInput style={{height:'100%',width:'100%'}} placeholder="write a message" value={msg} onChange={(e)=>handleSending(e)}
        endAdornment={<InputAdornment position="end">
        <input onChange={handleInputMedia} ref={media} type='file' style={{display:'none'}}/>
        <IconButton style={{color:'grey',marginRight:'5px'}} onClick={handleMedia} edge="end"><AttachFileIcon/></IconButton><IconButton style={{color:'grey'}} onClick={handleForm} edge="end"><SendIcon/></IconButton></InputAdornment>}/>
    </Comp4>
    </Box>

    </Comp2>

    </Comp>
  );
}

export default Front;

