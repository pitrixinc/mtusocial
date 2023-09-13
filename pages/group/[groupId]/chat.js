import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  where,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { db } from '../../../firebase';

const GroupChat = () => {
  const router = useRouter();
  const { groupId } = router.query;
  const { data: session } = useSession();
  const [group, setGroup] = useState({});
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false); // Add state for creator check
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!groupId) return;

    // Fetch group details
    const groupRef = doc(db, 'groups', groupId);
    getDoc(groupRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setGroup(docSnap.data());
          // Check if the current user is a member of the group
          if (session) {
            const groupMembersRef = collection(db, 'groups', groupId, 'members');
            const memberQuery = where('uid', '==', session.user.uid);
            const memberDocRef = doc(groupMembersRef, session.user.uid);

            getDoc(memberDocRef)
              .then((memberDocSnap) => {
                if (memberDocSnap.exists()) {
                  setIsMember(true);
                  loadMessages(groupId); // Pass the groupId to loadMessages

                  // Check if the current user is the creator of the group
                  if (group.creatorId === session.user.uid) {
                    setIsCreator(true);
                  }
                }
              })
              .catch((error) => {
                console.error('Error checking membership', error);
                router.push('/'); // Redirect to home or another page
              });
          }
        } else {
          console.error('Group not found');
          router.push('/'); // Redirect to home or another page
        }
      })
      .catch((error) => {
        console.error('Error fetching group', error);
        router.push('/'); // Redirect to home or another page
      });
  }, [groupId, session]);

  const loadMessages = (groupId) => {
    if (!groupId) return;

    // Create a reference to the group's messages subcollection
    const groupMessagesRef = collection(db, 'groups', groupId, 'messages');

    const unsubscribe = onSnapshot(groupMessagesRef, (querySnapshot) => {
      const updatedMessages = [];
      querySnapshot.forEach((doc) => {
        updatedMessages.push(doc.data());
      });
      setMessages(updatedMessages);
    });

    return unsubscribe;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage || !groupId) return;

    // Create a new message document in the group's messages subcollection
    try {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        text: newMessage,
        userId: session.user.uid,
        image: session.user.image,
        datePosted: serverTimestamp(),
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  if (!isMember) {
    return <p>You are not a member of this group.</p>;
  }

  return (
    <div>
      <div className="chat-navbar">
        <h1>Group Chat: {group.title}</h1>
        {isCreator && (
          <button
            onClick={() => router.push(`/group/manage-group/${groupId}`)}
            className="manage-group-button"
          >
            Manage Group
          </button>
        )}
      </div>
      {/* Display messages here */}
      <div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.userId === session.user.uid ? 'your-message' : 'other-message'}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Input field and send button */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default GroupChat;
