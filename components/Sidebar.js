import React, { useEffect, useState } from 'react'
import SidebarLink from './SidebarLink'
import { useRouter } from 'next/router'
import { AiFillHome, AiOutlineInbox, AiOutlineUser } from "react-icons/ai"
import { BiHash, BiSearchAlt, BiPoll, BiMessageAltAdd } from "react-icons/bi"
import { RiAdminLine, RiHashtag } from "react-icons/ri"
import { BsBell, BsBookmark, BsThreeDots} from "react-icons/bs"
import { HiOutlineClipboardList, HiOutlineDotsCircleHorizontal, HiOutlineUserGroup } from "react-icons/hi"
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions here
import { db } from '../firebase';
import mtuLogo from "../assets/images/mtulogo.jpg";
import { MdClose, MdOutlineEventNote } from 'react-icons/md'


const Sidebar = () => {
    const router = useRouter()
    const {data: session} = useSession()
    const [unreadNotifications, setUnreadNotifications] = useState(0); // Count of unread notifications
    const [isVerified, setIsVerified] = useState(false); // Add state for user verification

    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => {
      setShowSidebar(!showSidebar);
    };


    useEffect(() => {
      const fetchUserVerification = async () => {
        if (session) {
          // Check if the user is verified (you might need to adjust the condition)
          const userDoc = doc(db, 'users', session.user.uid);
          const userSnapshot = await getDoc(userDoc);
          const userData = userSnapshot.data();
          
          if (userData && userData.isVerified) {
            setIsVerified(true);
          }
        }
      };
  
      fetchUserVerification();
    }, [session]);


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
      <>
        <div className='hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full border-r border-gray-400 pr-0 xl:pr-8'>
            <div className='flex items-center justify-center w-14 h-14 hoverEffect p-0 xl:ml-24'>
                <Image className='rounded-[1px]' src={mtuLogo} height="74px" width="64px" />
            </div>
            <div className='space-y-2 mt-4 mb-2.5 xl:ml-24 text-[#16181C] overflow-y-scroll no-scrollbar'>
                <div onClick={() => router.push('/')}>
                <SidebarLink text="Home" Icon={AiFillHome} />
                </div>
                <div onClick={() => router.push('/search')}>
                <SidebarLink text="Search" Icon={BiSearchAlt} />
                </div>
                <div onClick={() => router.push(`/notifications/${session.user.uid}`)}>
                <div className='relative'>
                    <span className={`absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs text-center ${unreadNotifications > 0 ? 'block' : 'hidden'}`}>
                    {unreadNotifications > 0 ? unreadNotifications : ''}
                    </span>
                    <SidebarLink text='Notifications' Icon={BsBell} />
                </div>
                </div>
                <div onClick={() => router.push('/ConversationList')}>
                <SidebarLink text="Messages" Icon={BiMessageAltAdd} />
                </div>
                <div onClick={() => router.push('/group/my-groups')}>
                <SidebarLink text="Groups" Icon={HiOutlineUserGroup} />
                </div>
                <div onClick={() => router.push('/polls')}>
                <SidebarLink text="Polls" Icon={BiPoll} /> 
                </div>
                <div onClick={() => router.push('/events')}>
                <SidebarLink text="Events" Icon={MdOutlineEventNote} />
                </div>
                <div onClick={() => router.push(`/users/${session.user.uid}`)}>
                <SidebarLink text="Profile" Icon={AiOutlineUser} /> 
                </div>
             {/*<SidebarLink text="More" Icon={HiOutlineDotsCircleHorizontal} />*/}  

                 {/* Conditional rendering for Admin Panel */}
                 {session?.user?.uid === process.env.NEXT_PUBLIC_UID_ADMIN && (
                        <div onClick={() => router.push('/dashboard-for-admin')}>
                            <SidebarLink text="Admin Panel" Icon={RiAdminLine} />
                        </div>
                    )}

            </div>

           {isVerified ? (
            <button className="hidden xl:inline ml-auto bg-yellow-500 text-white rounded-full w-52 h-[52px] text-lg font-bold hover:bg-[#1a8cd8]">
                Write
            </button>
            ) : (
              <button className="hidden xl:inline ml-auto bg-yellow-500 text-white rounded-full w-52 h-[52px] text-lg font-bold hover:bg-[#1a8cd8]" onClick={() => router.push('/verify')}>
                Verify
            </button>
            )}

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

        
             {/* Use Tailwind CSS classes to conditionally display the bottom navigation bar */}
      <div className='fixed bottom-0 left-0 z-10 w-full md:hidden lg:hidden bg-white border-t border-gray-400 p-4 flex justify-between'>
        
        <AiFillHome className='text-xl cursor-pointer' onClick={() => router.push('/')} />
        <BiSearchAlt className='text-xl cursor-pointer' onClick={() => router.push('/search')}/>
        <div onClick={() => router.push(`/notifications/${session.user.uid}`)}>
                <div className='relative'>
                    <span className={`absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs text-center ${unreadNotifications > 0 ? 'block' : 'hidden'}`}>
                    {unreadNotifications > 0 ? unreadNotifications : ''}
                    </span>
                    <BsBell className='text-xl cursor-pointer' />
                </div>
                </div>
                <div onClick={() => router.push('/ConversationList')}>
                 <BiMessageAltAdd className='text-xl cursor-pointer' />
                </div>
              {/*  <div onClick={() => router.push(`/users/${session.user.uid}`)}>  */}
              <div onClick={toggleSidebar}>
                <img
                    src={session?.user?.image}
                    alt=""
                    className="h-6 w-6 rounded-full cursor-pointer"
                />
                </div>
          </div>

        {/* Sidebar */}
      {showSidebar && (
        <div 
          className="xl:hidden fixed top-0 z-10 left-0 w-[90%] h-screen bg-gray-100 p-4 transition-transform transform duration-300 ease-in-out"
          
        >
          <div
            className=" flex justify-end cursor-pointer"
            onClick={toggleSidebar}
          >  <MdClose className='text-[22px] cursor-pointer '/>
          </div>
          <div className='mt-10'>
           {/* Sidebar content goes here */} 
           <div onClick={() => router.push(`/users/${session.user.uid}`)} className='flex items-center gap-2 font-bold text-[20px] cursor-pointer mx-2'>
             <AiOutlineUser /> <span>Profile</span>
           </div>
           <div onClick={() => router.push('/group/my-groups')} className='flex items-center gap-2 font-bold text-[20px] cursor-pointer mt-8 mx-2'>
             <HiOutlineUserGroup /> <span>Groups</span>
           </div>
           <div onClick={() => router.push('/polls')} className='flex items-center gap-2 font-bold text-[20px] cursor-pointer mt-8 mx-2'>
             <BiPoll /> <span>Polls</span>
           </div>
           <div onClick={() => router.push('/events')} className='flex items-center gap-2 font-bold text-[20px] cursor-pointer mt-8 mx-2'>
              <MdOutlineEventNote /> <span>Events</span>
          </div>
           <div onClick={() => router.push('/hashtag-posts?hashtag=foryou')} className='flex items-center gap-2 font-bold text-[20px] cursor-pointer mt-8 mx-2'>
             <RiHashtag /> <span>Hashtags</span>
           </div>

          
        </div>
        <div
                className="text-black bottom-0 w-full flex items-center mt-[70px] py-4 px-1 shadow-md bg-white rounded-[20px]"
                onClick={signOut}
            >
                <img
                    src={session?.user?.image}
                    alt=""
                    className="h-8 w-8 rounded-full"
                />
                <div className="inline leading-5 gap-1">
                    <h4 className="font-semibold text-sm">{session?.user?.name.slice(0, 13)}</h4>
                    <p className="text-black text-sm">@{session?.user?.tag}</p>
                </div>
                <BsThreeDots className="h-5 inline ml-10" />
            </div>
        </div>

      )}
        </>
    )
}

export default Sidebar