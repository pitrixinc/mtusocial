import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useSession } from 'next-auth/react';
import Moment from 'react-moment';

export default function JoinViewGroupDetails() {
  const router = useRouter();
  const { groupId } = router.query;
  const { data: session } = useSession(); // Get the user session
  const [group, setGroup] = useState({});
  const [totalMessages, setTotalMessages] = useState(0);
  const [members, setMembers] = useState([]);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    // Fetch group details
    const groupRef = doc(db, 'groups', groupId);
    getDoc(groupRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setGroup(docSnap.data());
        } else {
          console.error('Group not found');
          router.push('/'); // Redirect to home or error page
        }
      })
      .catch((error) => {
        console.error('Error fetching group', error);
        router.push('/'); // Redirect to home or error page
      });




      const fetchMembers = () => {
        const membersRef = collection(db, 'groups', groupId, 'members');
        getDocs(membersRef)
          .then((snapshot) => {
            const membersData = [];
            snapshot.forEach((doc) => {
              membersData.push(doc.data());
            });
            setMembers(membersData);
          })
          .catch((error) => {
            console.error('Error fetching members', error);
          });
      };

      // Fetch members
    fetchMembers();
  }, [groupId, session]);

  const toggleMembersDropdown = () => {
    setShowMembersDropdown(!showMembersDropdown);
  };

  return (
    <div className='hidden lg:block w-[350px] mt-2 overflow-y-auto no-scrollbar'>
      <div  className='flex items-center p-4 border-b border-b-gray-300 shadow-md'>
         <h1 className='text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>Group Details</h1>
      </div>
        {/* <!-- Header image --> */}
    <div>
      <img src={group.groupBanner ||"https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"} className="w-[350px] h-[110px] mx-auto object-cover" />
    </div>

   {/* <!-- Profile picture and edit button --> */}
    <div class="flex items-start justify-between px-4 py-3">
      <img class="-mt-[4.5rem] h-32 w-32 cursor-pointer rounded-full ring-4 ring-gray-100" src={group.groupProfilePic || 'https://media.idownloadblog.com/wp-content/uploads/2017/03/Twitter-new-2017-avatar-001.png'} />
    </div>
    {/*}  <div>
        <img
          src={group.groupBanner}
          alt="Group Banner"
          className='w-[350px]'
        />
      </div>
      <div>
        <img
          src={group.groupProfilePic}
          alt="Group Profile Picture"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
          }}
        />
      </div> */}
       {/* <!-- Name and handle --> */}
     <div class="mt-2 px-4">
      <h2 class="text-xl md:text-3xl lg:text-3xl text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">{group.title || 'No Name'}</h2>
    </div>

   {/* <!-- Bio --> */}
    <div class="mt-4 px-4 text-center">
      <span>{group.description || 'No Bio'}</span>
    </div>

  {/*}  <!-- Location, CTA and join date --> */}
    <div class="mt-3 flex items-center text-center justify-center space-x-4 px-4">
      <div class="flex items-center justify-center text-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>

        <span class="text-gray-700 dark:text-gray-400 capitalize">Created <Moment fromNow>{group?.createdAt?.toDate()}</Moment></span>
      </div>
    </div>


    <div className="p-4 border border-gray-200 shadow-md rounded-lg bg-white mt-5 text-center font-semibold items-center">
      
      <div
        className="flex items-center cursor-pointer text-gray-600 text-sm text-center font-semibold justify-center"
      >
        <div className="">
          Total Members: {members.length}
         
        </div>
      </div>
      
    </div>
    </div>
  );
}
