import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, deleteDoc, doc, getDocs, getDoc, onSnapshot, orderBy, query, setDoc, addDoc, where } from 'firebase/firestore'
import { db } from '../firebase';
import { useRouter } from 'next/router';
import Post from './Post';
import Moment from 'react-moment';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { data: session } = useSession();

  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false)
{/* 
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (session?.user?.uid && id) {
          // Fetch all notifications
          const notificationsCollection = collection(db, 'notifications');
          const notificationsSnapshot = await getDocs(notificationsCollection);

          // Filter notifications based on recipientUserId
          const filteredNotifications = [];

          notificationsSnapshot.forEach((doc) => {
            const notification = doc.data();
            if (notification.recipientUserId === id) {
              filteredNotifications.push(notification);
            }
          });

          // Sort notifications by timestamp
          filteredNotifications.sort((a, b) =>
            b.timestamp.toDate() - a.timestamp.toDate()
          );

          setNotifications(filteredNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [session, id]);
*/}


const [notificationPost, setnotificationPost] = useState([]);
 // Fetch the user's posts and total post count
 useEffect(() => {
  const fetchUserPosts = async () => {
    try {
      if (id) { // Check if 'id' is available from the URL
        const q = query(collection(db, 'posts'), where('id', '==', id)); // Use 'id' from the URL
        const querySnapshot = await getDocs(q);

        const posts = [];
        querySnapshot.forEach((doc) => {
          // Assuming your post document structure, modify accordingly
          const post = {
            id: doc.id,
            username: doc.data().username,
            userImg: doc.data().userImg,
            tag: doc.data().tag,
            text: doc.data().text,
            image: doc.data().image,
            video: doc.data().video,
            timestamp: doc.data().timestamp, // Include the timestamp field
          };
          posts.push(post);
        });

        setnotificationPost(posts);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  if (session) {
    fetchUserPosts();
  }
}, [id, session]);



useEffect(() => {
  const loadNotifications = async () => {
    try {
      if (session?.user?.uid && id) {
        // Fetch all notifications
        const notificationsCollection = collection(db, 'notifications');
        const notificationsSnapshot = await getDocs(notificationsCollection);

        // Filter notifications based on recipientUserId
        const filteredNotifications = [];

        notificationsSnapshot.forEach((doc) => {
          const notification = doc.data();
          if (notification.recipientUserId === id) {
            filteredNotifications.push(notification);
          }
        });

        // Sort notifications by timestamp
        filteredNotifications.sort((a, b) =>
          b.timestamp.toDate() - a.timestamp.toDate()
        );

        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  loadNotifications();
}, [session, id]);

// Helper function to handle notification click
const handleNotificationClick = async (notification) => {
  if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'follow' || notification.type === 'repost') {
    // Update notification as read when clicked
    const notificationRef = doc(db, 'notifications', notification.id);
    await updateDoc(notificationRef, { read: true });

    // Redirect to the post or user profile based on the notification type
    if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'repost') {
      router.push(`/${notification.postId}`);
    } if (notification.type === 'follow') {
      router.push(`/users/${notification.senderUserId}`);
    } 
  }
};

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto no-scrollbar'>
      <div className="mx-auto flex h-screen w-full items-start justify-center bg-white text-sm text-gray-900 antialiased">
        <div>
          <h1 className='text-2xl font-bold text-center'>Notifications</h1>
          {/* 
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>
                <div onClick={() => router.push(`/users/${notification.senderUserId}`)} className='cursor-pointer'>
                  <img className='h-12 w-12 rounded-full object-cover' src={notification.senderImage} alt="" />
                  </div>
                <span onClick={() => router.push(`/users/${notification.senderUserId}`)} className='font-bold cursor-pointer'>{notification.senderName}</span> {notification.message} ({notification.timestamp.toDate().toLocaleString()})
              </li>
            ))}
          </ul>
          */}

<ul>
            {notifications.map((notification, index) => (
              <li
                key={index}
                onClick={() => handleNotificationClick(notification)} // Handle click on notification
                className={`cursor-pointer ${
                  notification.read ? 'text-gray-500' : 'text-gray-900 font-bold'
                }`}
              >
                
                {/* Display additional content based on notification type */}
                {notification.type === 'like' && (
                  <div className='ml-2 md:ml-0 lg:ml-0 border-b border-b-gray-200'>
                    <div className='cursor-pointer mt-2'>
                  <img className='h-12 w-12 rounded-full object-cover' src={notification.senderImage} alt="" />
                </div>
                <span className='font-bold cursor-pointer'>{notification.senderName}</span> {notification.message} <Moment fromNow>{notification.timestamp.toDate()}</Moment>
                    
                    <Post
                      id={notification.postId}
                      post={notificationPost.find((post) => post.id === notification.postId)} // Find the corresponding post in notificationPost
                    />
                  </div>
                )}
                {notification.type === 'comment' && (
                  <div className='ml-2 md:ml-0 lg:ml-0 border-b border-b-gray-200'>
                    <div className='cursor-pointer mt-2'>
                  <img className='h-12 w-12 rounded-full object-cover' src={notification.senderImage} alt="" />
                </div>
                <span className='font-bold cursor-pointer'>{notification.senderName}</span> {notification.message} <Moment fromNow>{notification.timestamp.toDate()}</Moment>
                  <div className="font-semibold"> {notification.comment} </div>
                    <Post
                      id={notification.postId}
                      post={notificationPost.find((post) => post.id === notification.postId)} // Find the corresponding post in notificationPost
                    />
                  </div>
                )}
               {notification.type === 'follow' && (
                <div className='ml-2 md:ml-0 lg:ml-0 border-b border-b-gray-200 py-2'>
                   <div className='cursor-pointer mt-2'>
                   <img className='h-12 w-12 rounded-full object-cover' src={notification.senderImage} alt="" />
                   </div>
                 <span className='font-bold cursor-pointer'>{notification.senderName}</span> {notification.message} <Moment fromNow>{notification.timestamp.toDate()}</Moment>
                 </div>
               )}
               {notification.type === 'repost' && (
                  <div className='ml-2 md:ml-0 lg:ml-0 border-b border-b-gray-200'>
                    <div className='cursor-pointer mt-2'>
                  <img className='h-12 w-12 rounded-full object-cover' src={notification.senderImage} alt="" />
                </div>
                <span className='font-bold cursor-pointer'>{notification.senderName}</span> {notification.message} <Moment fromNow>{notification.timestamp.toDate()}</Moment>
                <div className="font-semibold"> {notification.repostMessage} </div>
                    <Post
                      id={notification.postId}
                      post={notificationPost.find((post) => post.id === notification.postId)} // Find the corresponding post in notificationPost
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default NotificationPage;
