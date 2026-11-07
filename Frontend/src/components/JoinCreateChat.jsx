import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { IoLogoWechat } from "react-icons/io5";
import { createRoomAPI, joinChatAPI } from '../services/RoomService';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';

export const JoinCreateChat = () => {

  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  })

  const {setRoomId , setCurrentUser, setConnected} = useChatContext()
  const navigate = useNavigate()

  function handleFormInputChange(event){
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    })
  }

  function validateForm(){
    if(detail.roomId.trim() === "" || detail.userName.trim() === ""){
      toast.error("Invalid Input")
      return false;
    }
    return true;
  }

  async function joinChat(){
    if(validateForm()){
      // join chat
      try{
        const room = await joinChatAPI(detail.roomId.trim())
        toast.success("joined..")
        setCurrentUser(detail.userName)
        setRoomId(room.roomId)
        setConnected(true)
        navigate("/chat")

      }
      catch(error){
        if(error.status == 400){
          toast.error(error.response.data)
        }else{
          toast.error("Error in joining room !!")
        }
        console.log(error);
      }
    }
  }

  async function createRoom(){
    if(validateForm()){
      // create room
      // call api to create room on backend
      try{
        const response = await createRoomAPI(detail.roomId.trim())
        toast.success("Room created Successfully")
        //join the room
        setCurrentUser(detail.userName)
        setRoomId(response.roomId)
        setConnected(true)

        navigate("/chat")
        //forward to chat page..
  
      }catch(error){
        console.log(error)
        if(error.status == 400){
          toast.error("Room Id already exist !!")
        }else{
          toast.error("Error in creating room !!")
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
      
      
      <div className="absolute top-1/4 left-1/4 w-40rem h-40rem bg-cyan-900/20 rounded-full filter blur-[120px] pointer-events-none"></div>

     
      <div className="relative w-full max-w-md p-8 bg-[#121212] border border-gray-800 rounded-2xl shadow-2xl z-10">
        
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1">
            TWIK<span className="text-cyan-400 text-3xl"><IoLogoWechat /></span>CHAT
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium tracking-wide">
            Jump right in or start something new.
          </p>
        </div>

        
        <div className="space-y-7">
          <div className="relative group">
            <input 
              onChange={handleFormInputChange}
              value={detail.userName}
              type="text" 
              id="name"
              name ="userName"
              placeholder=" "
              className="peer w-full px-5 py-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-gray-100 placeholder-transparent focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
            />
            <label 
              htmlFor="name" 
              className="absolute left-4 -top-3 px-2 text-sm text-cyan-400 bg-[#121212] transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-600 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-sm peer-focus:text-cyan-400 peer-focus:bg-[#121212]"
            >
              Alias / Name
            </label>
          </div>

          <div className="relative group">
            <input 
              name='roomId'
              onChange={handleFormInputChange}
              value={detail.roomId}
              type="text" 
              id="roomId"
              placeholder=" "
              className="peer w-full px-5 py-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-gray-100 placeholder-transparent focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
            />
            <label 
              htmlFor="roomId" 
              className="absolute left-4 -top-3 px-2 text-sm text-cyan-400 bg-[#121212] transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-600 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-sm peer-focus:text-cyan-400 peer-focus:bg-[#121212]"
            >
              Room ID
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-10">
          <button onClick={joinChat} className="w-full py-4 rounded-xl font-bold text-[#0a0a0a] bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transform hover:-translate-y-0.5 transition-all duration-300">
            Enter Room 🚀
          </button>
          
          <div className="relative flex items-center justify-center w-full">
            <div className="h-px bg-gray-800 w-full"></div>
            <span className="absolute px-4 text-xs text-gray-600 bg-[#121212] uppercase tracking-widest font-semibold">Or</span>
          </div>

          <button onClick={createRoom} className="w-full py-4 rounded-xl font-bold text-gray-400 bg-transparent border border-gray-700 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300">
            New Room ✨
          </button>
        </div>

      </div>
    </div>
  );
};