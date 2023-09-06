import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useSession } from 'next-auth/react';

// Display notifications
const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (session?.user?.uid) {
          const notificationsQuery = query(
            collection(db, 'notifications'),
            where('recipientUserId', '==', session?.user.uid), // Filter by recipientUserId
            orderBy('timestamp', 'desc')
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          const notifications = notificationsSnapshot.docs.map((doc) => doc.data());
          setNotifications(notifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [session]);

  console.log(session.user.uid)
  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            {notification.message} ({notification.timestamp.toDate().toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPage;
