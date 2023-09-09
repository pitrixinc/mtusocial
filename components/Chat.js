import React, { useState, useEffect } from 'react';
import {  collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where, getDoc, doc  } from 'firebase/firestore';
import { useSession } from "next-auth/react"
import { db } from '../firebase'
import { useRouter } from 'next/router'
import { RiSendPlaneFill } from "react-icons/ri"
import { AiOutlineArrowLeft } from "react-icons/ai"
import Moment from 'react-moment'

const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userInfo, setUserInfo] = useState({}); // Add state for user info
  const router = useRouter()
  const { id } = router.query;

  useEffect(() => {
    if (!session || !id) return;

    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50) // Adjust as needed
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMessages = [];
      querySnapshot.forEach((doc) => {
        const message = doc.data();
        // Check if the message is between the current user and the specified user
        if ((message.fromId === session.user.uid && message.toId === id) ||
            (message.fromId === id && message.toId === session.user.uid)) {
          updatedMessages.push(message);
        }
      });
      setMessages(updatedMessages);
    });

    // Fetch the user's info and set it in state
    const fetchUserInfo = async () => {
      const userDoc = doc(db, 'users', id); // Assuming you have a 'users' collection
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        setUserInfo(userSnap.data()); // Set the entire user document
      }
    };

    fetchUserInfo();

    return unsubscribe;
  }, [session, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage || !id) return;

    // Create a new message document in Firestore
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      fromId: session.user.uid,
      toId: id,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] overflow-y-auto no-scrollbar bg-white'>
   <div className='flex items-center p-4 border-b border-b-gray-300 shadow-md'>
          <button onClick={() => router.push(`/ConversationList`)} className='mr-2 text-blue-500 hover:underline'>
            <AiOutlineArrowLeft className='text-2xl text-black'/>
          </button>
          {userInfo.profileImage && (
            <img
              src={userInfo.profileImage}
              alt={`${userInfo.name}'s Profile`}
              className='w-8 h-8 rounded-full object-cover mr-2'
            />
          )}
          <h1 className='text-xl font-semibold'>{userInfo.name}</h1>
        </div>
        
      

<div className='flex flex-col p-4 space-y-2'>
  {messages.length === 0 ? (
    <div className='text-center text-gray-500'>No messages, start a conversation with <span className='bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{userInfo.name}</span></div>
  ) : (
    messages.map((message) => (
      <div
        key={message.id}
        className={`${
          message.fromId === session.user.uid
            ? 'self-end bg-yellow-500 text-white rounded-tl-lg rounded-bl-lg rounded-tr-lg p-2 max-w-[70%]'
            : 'self-start bg-gray-200 rounded-tr-lg rounded-br-lg rounded-tl-lg p-2 max-w-[70%]'
        }`}
      >
        <div className='mb-1'>{message.text}</div>
        <div className='text-gray-500 text-sm'><Moment fromNow>{message.timestamp?.toDate()}</Moment></div>
      </div>
    ))
  )}
</div>


  {/* Input field and send button */}
  <form onSubmit={handleSubmit} className='p-4 border-t border-gray-300'>
    <div className='flex'>
      <input
        type="text"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className='flex-grow px-4 py-2 rounded-l-lg focus:outline-none focus:ring focus:border-yellow-300'
      />
      <button
        type="submit"
        className='bg-yellow-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg focus:outline-none focus:ring focus:border-yellow-300'
      >
       <RiSendPlaneFill className='text-white text-2xl' />
      </button>
    </div>
  </form>
</section>

  );
};

export default Chat;
