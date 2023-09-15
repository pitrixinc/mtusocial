import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { AiOutlineArrowLeft } from "react-icons/ai"

const ListConversation = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({}); // Add state for user info

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session) return;

      const messagesCollection = collection(db, 'messages');
      const messagesQuery = query(
        messagesCollection,
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(messagesQuery);

      const conversationMap = new Map(); // Use a map to track conversations

      const promises = [];

      querySnapshot.forEach((doc) => {
        const message = doc.data();

        // Check if the message is between the current user and another user
        if (
          (message.fromId === session.user.uid || message.toId === session.user.uid) &&
          message.toId !== message.fromId
        ) {
          const otherUserId = message.fromId === session.user.uid ? message.toId : message.fromId;
          const conversation = conversationMap.get(otherUserId) || {
            userId: otherUserId,
            lastMessage: message.text,
          };

          // Update the last message in the conversation if the message is the most recent
if (!conversation.lastMessageTimestamp || conversation.lastMessageTimestamp < message.timestamp) {
    conversation.lastMessage = message.text;
    conversation.lastMessageTimestamp = message.timestamp;
  }
  

          // Set the conversation in the map
          conversationMap.set(otherUserId, conversation);

          // Fetch user info for this conversation directly from the 'users' collection
          const usersCollection = collection(db, 'users');
          const usersQuery = query(
            usersCollection,
            where('id', '==', otherUserId)
          );

          const userPromise = getDocs(usersQuery).then((userQuerySnapshot) => {
            if (!userQuerySnapshot.empty) {
              userQuerySnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                setUserInfo((prevUserInfo) => ({
                  ...prevUserInfo,
                  [otherUserId]: userData,
                }));
              });
            }
          });
          

          promises.push(userPromise);
        }
      });

      await Promise.all(promises);

      const conversationList = Array.from(conversationMap.values());

      setConversations(conversationList);
    };

    fetchConversations();
  }, [session]);

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto no-scrollbar'>
    <div className="bg-white shadow-sm rounded-lg p-4 border-b border-b-gray-300">
   <div className='flex items-center p-4 border-b border-b-gray-300 shadow-md'>
          <button onClick={() => router.push(`/`)} className='mr-2 text-blue-500 hover:underline'>
            <AiOutlineArrowLeft className='text-2xl text-black'/>
          </button>
  <h1 className="text-xl text-center font-semibold">Conversation List</h1>
  </div>
  {conversations.length === 0 ? (
    <div className='flex justify-center items-center min-h-screen'>
    <p className="bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center">No conversation, all your conversations with other users will be shown here.</p>
    </div>
  ) : (
    <ul className="space-y-4">
      {conversations.map((conversation) => (
        <li
          key={conversation.userId}
          onClick={() => router.push(`/conversation/${conversation.userId}`)}
          className="cursor-pointer flex items-center p-3 rounded-lg hover:bg-gray-100 transition duration-300  border-b border-b-gray-300  border-t border-t-gray-200"
        >
          <img
            src={userInfo[conversation.userId]?.profileImage || '/default-avatar.png'}
            alt={userInfo[conversation.userId]?.name}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div className="flex-1">
            <p className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">
              {userInfo[conversation.userId]?.name.slice(0, 17)} {conversation.lastMessage.length > 17 && '...'}
            </p>
            <p className="text-gray-600">
              {conversation.lastMessage.slice(0, 25)}{conversation.lastMessage.length > 25 && '...'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
</section>
  );
};

export default ListConversation;
