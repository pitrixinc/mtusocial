import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { data: session } = useSession();

  const router = useRouter();
  const { id } = router.query;

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

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto no-scrollbar'>
      <div className="mx-auto flex h-screen w-full items-start justify-center bg-white text-sm text-gray-900 antialiased">
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
      </div>
    </section>
  );
};

export default NotificationPage;
