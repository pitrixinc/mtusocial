import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useSession } from 'next-auth/react';
import Moment from 'react-moment';
import { toast } from 'react-toastify';
import { MdVerified } from 'react-icons/md';
import CryptoJS from 'crypto-js';

export default function JoinViewGroup() {
  const router = useRouter();
  const { groupId } = router.query;
  const [group, setGroup] = useState({});
  const [isMember, setIsMember] = useState(false);
  const [password, setPassword] = useState('');
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(false);

  // Decrypt the password using the secret key
  const decryptPassword = (encryptedPassword, secretKey) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
      return originalPassword;
    } catch (error) {
      console.error('Error decrypting password', error);
      return null;
    }
  };

  const joinGroup = async () => {
    try {
      // Decrypt the entered password using the secret key
      const secretKey = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY; // Replace with your actual secret key
      const decryptedPassword = decryptPassword(group.password, secretKey);

      if (group.private && password !== decryptedPassword) {
        toast.error('Incorrect group password');
        return;
      }

      // Check if the user is already a member
      const membersCollectionRef = collection(db, 'groups', groupId, 'members');
      const memberDocRef = doc(membersCollectionRef, session?.user.uid);
      const memberDocSnap = await getDoc(memberDocRef);

      if (!memberDocSnap.exists()) {
        // Add the user to the group's members list
        await setDoc(memberDocRef, {
          uid: session?.user.uid,
          name: session?.user.name,
          email: session?.user.email,
          image: session?.user.image,
          dateJoined: serverTimestamp(), // Change to the appropriate date format
          // You can add other member-related data here
        });
        toast.success("You joined successfully");
        setIsMember(true); // Set isMember to true after successfully joining
      } else {
        toast.success("You are a member of this group");
        setIsMember(true); // Set isMember to true if the user is already a member
      }
    } catch (error) {
      console.error('Error joining group', error);
    }
  };

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
            const membersCollectionRef = collection(db, 'groups', groupId, 'members');
            const memberDocRef = doc(membersCollectionRef, session.user.uid);
            getDoc(memberDocRef).then((memberDocSnap) => {
              if (memberDocSnap.exists()) {
                setIsMember(true);
              }
            });
          }
        } else {
          console.error('Group not found');
          toast.error('Group not found');
          router.push('/'); // Redirect to home or another page
        }
      })
      .catch((error) => {
        console.error('Error fetching group', error);
        router.push('/'); // Redirect to home or another page
      });
  }, [groupId, session]);

  useEffect(() => {
    if (session) {
      // Check if the user is verified (you might need to adjust the condition)
      const userDoc = doc(db, 'users', session.user.uid);
      getDoc(userDoc)
        .then((userSnapshot) => {
          const userData = userSnapshot.data();
          if (userData && userData.isVerified) {
            setIsVerified(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data', error);
        });
    }
  }, [session]);

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-0 overflow-y-auto no-scrollbar'>
      <div className='mt-0'>
        {/* Header image */}
        <div className='mt-0'>
          <img src={group.groupBanner || "https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"} className="w-[100%] h-[190px] mx-auto object-cover mt-0" />
        </div>

        {/* Profile picture and edit button */}
        <div class="flex items-start justify-between px-4 py-3">
          <img class="-mt-[4.5rem] h-32 w-32 cursor-pointer rounded-full ring-4 ring-gray-100" src={group.groupProfilePic || 'https://media.idownloadblog.com/wp-content/uploads/2017/03/Twitter-new-2017-avatar-001.png'} />
        </div>

        {/* Name and handle */}
        <div class="mt-2 px-4 flex items-center justify-center">
          <h2 class="text-xl md:text-3xl lg:text-3xl text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">{group.title || 'No Name'}</h2> {group?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline text-2xl mt-2 ml-2" />) } {group?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-2 ml-2 text-2xl" />) }
        </div>

        {/* Bio */}
        <div class="mt-4 px-4 text-center">
          <span>{group.description || 'No Bio'}</span>
        </div>

        {/* Location, CTA and join date */}
        <div class="mt-3 flex items-center text-center justify-center space-x-4 px-4">
          <div class="flex items-center justify-center text-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>

            <span class="text-gray-700 dark:text-gray-400 capitalize">Created <Moment fromNow>{group?.createdAt?.toDate()}</Moment></span>
          </div>
        </div>

        {isVerified ? (
          isMember ? (
            <div className=' flex justify-center items-center'>
            <button onClick={() => router.push(`/group/${groupId}/chat`)} className='mx-3 text-white bg-yellow-500 font-semibold text-center p-3 rounded-[20px] mt-5 mb-[60px]'>View Group</button>
            </div>
          ) : (
            <>
              {group.private && (
                <div className="bg-gray-200 mt-2 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] mx-3">
                <input
                  type="password"
                  placeholder="Enter Group Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent w-[100%] outline-none"
                />
                </div>
              )}
              <div className=' flex justify-center items-center'>
              <button className=' mx-3 text-white bg-yellow-500 font-semibold text-center p-3 rounded-[20px] mt-5 mb-[60px]' onClick={joinGroup}>Join Group</button>
              </div>
            </>
          )
        ) : (
          <p className="text-red-500 mt-5 text-center">Please verify your account to join this group.</p>
        )}
        {/* Display group members */}
      </div>
    </section>
  );
}
