import React, { useEffect, useState } from 'react'
import SidebarLink from './SidebarLink'
import { useRouter } from 'next/router'
import { AiFillHome, AiOutlineInbox, AiOutlineUser } from "react-icons/ai"
import { BiHash } from "react-icons/bi"
import { BsBell, BsBookmark, BsThreeDots} from "react-icons/bs"
import { HiOutlineClipboardList, HiOutlineDotsCircleHorizontal } from "react-icons/hi"
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'; // Import Firestore functions here
import { db } from '../firebase';
import mtuLogo from "../assets/images/mtulogo.jpg";

const Sidebar = () => {
    const router = useRouter()
    const {data: session} = useSession()
    const [unreadNotifications, setUnreadNotifications] = useState(0); // Count of unread notifications

    useEffect(() => {
        // Fetch the count of unread notifications and update the state
        const fetchUnreadNotificationsCount = async () => {
          try {
            if (session?.user?.uid) {
              const notificationsCollection = collection(db, 'notifications');
              const notificationsSnapshot = await getDocs(notificationsCollection);
      
              let count = 0;
      
              notificationsSnapshot.forEach(async (notificationDoc) => {
                const notification = notificationDoc.data();
                if (notification.recipientUserId === session.user.uid && !notification.read) {
                  count++;
                  // Mark the notification as read in Firestore
                  await updateDoc(doc(db, 'notifications', notificationDoc.id), {
                    read: true,
                  });
                }
              });
      
              setUnreadNotifications(count);
            }
          } catch (error) {
            console.error('Error fetching and updating unread notifications count:', error);
          }
        };
      
        fetchUnreadNotificationsCount();
      }, [session]);
      
    return (
        <div className='hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full border-r border-gray-400 pr-0 xl:pr-8'>
            <div className='flex items-center justify-center w-14 h-14 hoverEffect p-0 xl:ml-24'>
                <Image className='rounded-[1px]' src={mtuLogo} height="74px" width="64px" />
            </div>
            <div className='space-y-2 mt-4 mb-2.5 xl:ml-24 text-[#16181C]'>
                <div onClick={() => router.push('/')}>
                <SidebarLink text="Home" Icon={AiFillHome} />
                </div>
                <SidebarLink text="Explore" Icon={BiHash} />
                <div onClick={() => router.push(`/notifications/${session.user.uid}`)}>
                <div className='relative'>
                    <span className={`absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs text-center ${unreadNotifications > 0 ? 'block' : 'hidden'}`}>
                    {unreadNotifications > 0 ? unreadNotifications : ''}
                    </span>
                    <SidebarLink text='Notifications' Icon={BsBell} />
                </div>
                </div>
                <SidebarLink text="Messages" Icon={AiOutlineInbox} />
                <SidebarLink text="Bookmarks" Icon={BsBookmark} />
                <SidebarLink text="Lists" Icon={HiOutlineClipboardList} />
                <div onClick={() => router.push(`/users/${session.user.uid}`)}>
                <SidebarLink text="Profile" Icon={AiOutlineUser} />
                </div>
                <SidebarLink text="More" Icon={HiOutlineDotsCircleHorizontal} />
            </div>

            <button className="hidden xl:inline ml-auto bg-yellow-500 text-white rounded-full w-52 h-[52px] text-lg font-bold hover:bg-[#1a8cd8]">
                Write
            </button>

            <div
                className="text-[#d9d9d9] flex items-center justify-center mt-auto hoverEffect xl:ml-auto xl:-mr-5 px-4 py-2"
                onClick={signOut}
            >
                <img
                    src={session?.user?.image}
                    alt=""
                    className="h-10 w-10 rounded-full xl:mr-2.5"
                />
                <div className="hidden xl:inline leading-5">
                    <h4 className="font-bold">{session?.user?.name}</h4>
                    <p className="text-[#6e767d]">@{session?.user?.tag}</p>
                </div>
                <BsThreeDots className="h-5 hidden xl:inline ml-10" />
            </div>

        </div>
    )
}

export default Sidebar