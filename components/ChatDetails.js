import React, { useState, useEffect } from 'react';
import {  collection,
  where,
  doc,
  getDoc,
  getDocs,
  addDoc,
  unsubscribe,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
 } from 'firebase/firestore';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import { db, storage } from '../firebase';
import { AiOutlineArrowLeft, AiOutlineVideoCameraAdd, AiOutlineClose } from 'react-icons/ai';
import { VscSettings } from 'react-icons/vsc';
import { HiOutlineDocumentAdd } from 'react-icons/hi';
import { BsEmojiSmile, BsImage, BsFileEarmarkMusic } from 'react-icons/bs';
import { FaFileDownload } from 'react-icons/fa';
import Moment from 'react-moment'
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { FcDocument } from 'react-icons/fc';


const ChatDetails = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userInfo, setUserInfo] = useState({}); // Add state for user info
    const router = useRouter();
    const [totalMessages, setTotalMessages] = useState(0);
    const { id } = router.query;



    useEffect(() => {
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




    // ...

useEffect(() => {
    // Fetch total number of messages between the current user and the other user
    if (session && id) {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('fromId', '==', session.user.uid),
        where('toId', '==', id)
      );
  
      getDocs(messagesQuery)
        .then((snapshot) => {
          // Count messages from the current user to the other user
          const sentMessagesQuery = query(
            collection(db, 'messages'),
            where('fromId', '==', session.user.uid),
            where('toId', '==', id)
          );
  
          getDocs(sentMessagesQuery)
            .then((sentSnapshot) => {
              // Count messages from the other user to the current user
              const receivedMessagesQuery = query(
                collection(db, 'messages'),
                where('fromId', '==', id),
                where('toId', '==', session.user.uid)
              );
  
              getDocs(receivedMessagesQuery)
                .then((receivedSnapshot) => {
                  // Calculate the total number of messages
                  const totalMessages =
                    sentSnapshot.size + receivedSnapshot.size;
                  setTotalMessages(totalMessages);
                })
                .catch((error) => {
                  console.error('Error fetching received messages', error);
                });
            })
            .catch((error) => {
              console.error('Error fetching sent messages', error);
            });
        })
        .catch((error) => {
          console.error('Error fetching messages', error);
        });
    }
  }, [session, id]);
  
  // ...
  


  return (
    <div className='hidden lg:block w-[350px] mt-2 h-screen overflow-y-auto no-scrollbar'>
    <div  className='flex items-center p-4 border-b border-b-gray-300 shadow-md'>
       <h1 className='text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>Chat Details</h1>
    </div>
      <diV onClick={() => router.push(`/users/${id}`)}>
      {/* <!-- Header image --> */}
      <div>
      <img src={userInfo.headerImage ||"https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"} className="w-[350px] h-[110px] mx-auto object-cover rounded-[10px]" />
    </div>

   {/* <!-- Profile picture and edit button --> */}
    <div class="flex items-start justify-between px-4 py-3">
      <img class="-mt-[4.5rem] h-32 w-32 cursor-pointer rounded-full ring-4 ring-gray-100" src={userInfo.profileImage || 'https://media.idownloadblog.com/wp-content/uploads/2017/03/Twitter-new-2017-avatar-001.png'} />
    </div>

    <div class="mt-2 px-4">
      <h2 class="text-xl md:text-3xl lg:text-3xl text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">{userInfo.name  || 'No Name'}</h2>
    </div>

   {/* <!-- Bio --> */}
    <div class="mt-4 px-4 text-center">
      <span>{userInfo.bio || 'No Bio'}</span>
    </div>

    <div className="p-4 border border-gray-200 shadow-md rounded-lg bg-white mt-5 text-center font-semibold items-center">
      
      <div
        className="flex items-center cursor-pointer text-gray-600 text-sm text-center font-semibold justify-center"
      >
        <div className="">
          Total Messages: {totalMessages}
         
        </div>
      </div>
      
    </div>
    
    </diV>
    </div>
  )
}

export default ChatDetails