import React, { useState , useRef, useEffect } from 'react';
import { IoMdSend, IoMdAttach } from "react-icons/io";
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getMessages } from '../services/RoomService';
import { getTimeAgo } from '../config/helper'


const ChatPage = () => {

    const{roomId, currentUser , connected , setConnected, setRoomId, setCurrentUser} = useChatContext()


    const navigate = useNavigate()
    useEffect(() => {
        if(!connected){
            navigate("/")
        }
    }, [connected, navigate])



const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const chatBoxRef = useRef(null)
const [stompClient, setStompClient] = useState(null)

// page init:
// message ko load karna hoga

useEffect(() => {
    async function loadMessage() {
        try{
            const messages = await getMessages(roomId);
            // console.log(messages);
            setMessages(messages)
        }
        catch(error){
            console.error(error);

        }
    }
     if (connected) {
        loadMessage();
    }
},[connected, roomId])

// scroll down

   useEffect(() => {

    if(chatBoxRef.current){
        chatBoxRef.current.scroll({
            top:chatBoxRef.current.scrollHeight,
            behavior: "smooth",
        })
    }
   }, [messages])

// stompClient ko init karna hoga
   // subscribe

   useEffect(() => {
        if (!connected || !roomId) return;

        const sock = new SockJS(`${baseURL}/chat`)
        const client = Stomp.over(sock)
        client.debug = () => {} // silence STOMP logs in production

        client.connect({}, () => {
            setStompClient(client)
            toast.success("Connected")
            client.subscribe(`/topic/room/${roomId}`, (message) => {
                const newMessage = JSON.parse(message.body)
                setMessages((prev) => [...prev, newMessage])
            })
        }, () => {
            toast.error("Connection to chat server lost")
        })

        // close the socket when leaving the page so we don't leak connections
        return () => {
            if (client.connected) client.disconnect()
        }
   },[roomId, connected])


//send message handle

 const sendMessage = async () =>{
    if(stompClient && connected && input.trim()) {

        const message= {
            sender:currentUser,
            content: input,
            roomId:roomId
        }

        stompClient.send(`/app/sendMessage/${roomId}`,
            {},
            JSON.stringify(message))
            setInput("")
    }
 }

 // logout

    function handleLogOut(){
        if (stompClient?.connected) stompClient.disconnect()
        setConnected(false)
        setRoomId('')
        setCurrentUser('')
        navigate("/")
    }

    // enter key

    const handleKeyDown = (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
};

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-gray-100 font-sans">
        
        
        <header className="h-20 w-full bg-[#121212] border-b border-gray-800 flex items-center justify-between px-6 z-10 shadow-md">
          
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Room</span>
                <h1 className="text-xl font-bold text-cyan-400">Room: <span>{roomId}</span></h1>
            </div>
            
            <div className="hidden sm:flex flex-col items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Logged in as</span>
                <h1 className="text-lg font-medium text-white"><span>{currentUser}</span></h1>
            </div>

            <div>
                <button 
                 onClick={handleLogOut}
                 className="flex items-center gap-2 px-5 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    <span className="font-semibold text-sm">Leave Room</span>
                </button>
            </div>
        </header>

        
        <main ref={chatBoxRef}
              className="flex-1 overflow-y-auto  p-6 space-y-6 [&::-webkit-scrollbar]:hidden">
            {
                messages.map((message,index)=>(
                   <div key={index} className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}>

                    <div className='bg-[#121212] border border-gray-800 p-4 rounded-2xl rounded-tl-sm max-w-md shadow-sm'>

                        <div>
                            <p className="text-xs text-cyan-400 mb-1 font-medium">{message.sender}</p>
                            <p  className="text-gray-300 text-sm leading-relaxed">{message.content}</p>
                            <p className="text-[11px] text-gray-400 text-right mt-1">{getTimeAgo(message.timeStamp)}</p>

                        </div>
                    </div>
                    </div>
                ))
            }

        </main>

        
        <footer className="w-full bg-[#121212] border-t border-gray-800 p-4">
            <div className="max-w-5xl mx-auto flex items-center gap-2 bg-[#0a0a0a] rounded-2xl p-2 border border-gray-800 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all duration-300">
                
                
                <label className="cursor-pointer h-11 w-11 flex justify-center items-center rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-300">
                    <input type="file" className="hidden" />
                    <IoMdAttach size={24} />
                </label>

                
                <input 
                value={input}
                onChange={(e) => {
                    setInput(e.target.value)
                }}
                  onKeyDown={handleKeyDown}
                    type="text" 
                    placeholder="Type your message here..." 
                    className="flex-1 bg-transparent px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none" 
                />
                
                
                <button 
                onClick={sendMessage}
                className="h-11 w-11 bg-cyan-400 hover:bg-cyan-300 text-[#0a0a0a] flex justify-center items-center rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-105 shrink-0">
                    <IoMdSend size={22} className="ml-1" />
                </button>

            </div>
        </footer>
        
    </div>
  )
}

export default ChatPage;