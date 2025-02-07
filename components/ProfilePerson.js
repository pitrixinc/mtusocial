import React, { useContext, useEffect, useState } from 'react'
import { BiMessageSquareAdd } from "react-icons/bi"
import { RiUserFollowFill, RiUserUnfollowFill } from "react-icons/ri"
import { AiOutlineHeart, AiOutlineShareAlt, AiFillHeart } from 'react-icons/ai'
import { RiDeleteBin5Line } from 'react-icons/ri'
import Moment from 'react-moment'

import { db } from "../firebase"
import { useRouter } from 'next/router'
import { collection, deleteDoc, doc, getDocs, getDoc, onSnapshot, orderBy, query, setDoc, addDoc, where } from 'firebase/firestore'
import { useSession, getSession  } from "next-auth/react"
import { AppContext } from '../contexts/AppContext'
import Post from '../components/Post';
import UpdateProfileModal from './UpdateProfileModal';
import { MdClose } from 'react-icons/md'
import Link from 'next/link'

const ProfilePerson = ({ post, allPosts }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true); // State to track loading status
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const router = useRouter()

  const [appContext, setAppContext] = useContext(AppContext)

  // post display
  const [userPosts, setUserPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);

  const { id } = router.query;

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

        setUserPosts(posts);
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


  // Filter the userPosts to only include posts with media (image or video)
  const postsWithMedia = userPosts.filter((post) => post.image || post.video);

 // to make the likes available to all users use id but to display it to only the session user use session.user.uid
  const [likePosts, setLikePosts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsQuery = query(collection(db, 'posts'));
        const postsSnapshot = await getDocs(postsQuery);

        const userLikedPosts = [];

        for (const postDoc of postsSnapshot.docs) {
          const likesQuery = query(collection(db, 'posts', postDoc.id, 'likes'), where('id', '==', id));
          const likesSnapshot = await getDocs(likesQuery);

          if (!likesSnapshot.empty) {
            userLikedPosts.push({ id: postDoc.id, ...postDoc.data() });
          }
        }

        setLikePosts(userLikedPosts);
      } catch (error) {
        console.error('Error fetching user posts: ', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, id]);


  //reposting to appear on profile
  const [rePosts, setRePosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repostsQuery = query(collection(db, 'posts'));
        const repostsSnapshot = await getDocs(repostsQuery);

        const userRePosts = [];

        for (const postDoc of repostsSnapshot.docs) {
          const repostQuery = query(collection(db, 'posts', postDoc.id, 'rePost'), where('userId', '==', id));
          const repostSnapshot = await getDocs(repostQuery);

          if (!repostSnapshot.empty) {
            userRePosts.push({ id: postDoc.id, ...postDoc.data() });
          }
        }

        setRePosts(userRePosts);
      } catch (error) {
        console.error('Error fetching user posts: ', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, id]);



  
  
  const [activeTab, setActiveTab] = useState('Posts'); // Initialize with the default tab

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Define the content for each tab
  const tabContents = {
    Posts: <div>{userPosts.length === 0 ? (
      <p className='text-xl text-semibold text-center text-gray-600 mb-[60px]'>You have no post.</p>
              ) : (
                userPosts.map((post) => (
                  <Post key={post.id} id={post.id} post={post} />
                ))
              )}</div> ,
    'Reposts': <div>{rePosts.length === 0 ? (
      <p className='text-xl text-semibold text-center text-gray-600 mb-[60px]'>You have no repost.</p>
                        ) : (
                          rePosts.map((post) => (
                            <Post key={post.id} id={post.id} post={post} />
                          ))
                        )}</div>,
    Media: <div>{postsWithMedia.length === 0 ? (
      <p className='text-xl text-semibold text-center text-gray-600 mb-[60px]'>You have no media.</p>
                      ) : (
                        postsWithMedia.map((post) => (
                          <Post key={post.id} id={post.id} post={post} />
                        ))
                      )}</div>,
    Likes: <div>{likePosts.length === 0 ? (
      <p className='text-xl text-semibold text-center text-gray-600 mb-[60px]'>You have not liked any posts yet.</p>
    ) : (
      likePosts.map((post) => (
        <Post key={post.id} id={post.id} post={post} />
      ))
    )}</div>,
  };

 {/* console.log('Router Query:', router.query);

console.log('UID from URL:', id); */}


  const [updatedProfile, setUpdatedProfile] = useState(null);

  useEffect(() => {
    // Fetch user data based on the ID from the URL
    if (id) {
      // Use 'id' to fetch user data
      const fetchUserDataByUid = async (userId) => {
        try {
          // Replace 'users' with the correct Firestore collection name if needed
          const userDoc = doc(db, 'users', userId);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setUpdatedProfile(userSnapshot.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      fetchUserDataByUid(id); // Fetch user data by 'id'
    }
  }, [id]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const followUser = async () => {
    try {
      // Get the updated name from the updatedProfile state
      const updatedName = updatedProfile ? updatedProfile.name : session.user.name;
      const updatedImage = updatedProfile ? updatedProfile.profileImage : session.user.image;
  
      // Add the follower to the user being followed's followers subcollection
      await setDoc(doc(db, 'users', id, 'followers', session.user.uid), {
        id: session.user.uid,
        name: updatedName, // Use the updated name
        profileImage: updatedImage,
        dateFollowed: new Date(),
      });
  
      // Retrieve the data of the user being followed (UPS PI)
      const userBeingFollowedDoc = await getDoc(doc(db, 'users', id));
  
      if (userBeingFollowedDoc.exists()) {
        const userBeingFollowedData = userBeingFollowedDoc.data();
  
        // Add the user being followed (UPS PI) to the follower's following subcollection
        await setDoc(doc(db, 'users', session.user.uid, 'following', id), {
          id: id, // Use the id of UPS PI
          name: userBeingFollowedData.name, // Use UPS PI's name
          profileImage: userBeingFollowedData.profileImage,
          dateFollowed: new Date(),
        });
  
        setIsFollowing(true);
  
        // Update the followers subcollection for UPS PI
        await setDoc(doc(db, 'users', id, 'followers', session.user.uid), {
          id: session.user.uid,
          name: session.user.name, // Use Queen Cynthia's name
          profileImage: session.user.image,
          dateFollowed: new Date(),
        });

        // Create a notification for the user being followed (UPS PI)
        await addDoc(collection(db, 'notifications'), {
          recipientUserId: id, // UPS PI's user ID
          senderUserId: session.user.uid, // Queen Cynthia's user ID
          type: 'follow',
          senderName: session.user.name,
          senderImage: session.user.image,
          message:  'followed you.',
          timestamp: new Date(),
          read: false,
        });

      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };
  
  
  {/*
   const followUser = async () => {
    try {
      // Add the follower to the user being followed's followers subcollection
      await setDoc(doc(db, 'users', id, 'followers', session.user.uid), {
        id: session.user.uid,
        name: session.user.name,
        dateFollowed: new Date(),
      });

      // Add the user being followed to the follower's following subcollection
      await setDoc(doc(db, 'users', session.user.uid, 'following', id), {
        id: session.user.uid,
        name: session.user.name,
        dateFollowed: new Date(),
      });

      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };
*/}
  

  const unfollowUser = async () => {
    try {
      // Remove the follower from the user being followed's followers subcollection
      await deleteDoc(doc(db, 'users', id, 'followers', session.user.uid));

      // Remove the user being followed from the follower's following subcollection
      await deleteDoc(doc(db, 'users', session.user.uid, 'following', id));

      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const followingRef = collection(db, 'users', session.user.uid, 'following');
        const followingSnapshot = await getDocs(followingRef);
        const followingList = followingSnapshot.docs.map((doc) => doc.id);

        setIsFollowing(followingList.includes(id));
      } catch (error) {
        console.error('Error checking following:', error);
      }
    };

    const fetchFollowersCount = async () => {
      try {
        const followersRef = collection(db, 'users', id, 'followers');
        const followersSnapshot = await getDocs(followersRef);
        setFollowersCount(followersSnapshot.size);
      } catch (error) {
        console.error('Error fetching followers count:', error);
      }
    };

    const fetchFollowingCount = async () => {
      try {
        const followingRef = collection(db, 'users', id, 'following');
        const followingSnapshot = await getDocs(followingRef);
        setFollowingCount(followingSnapshot.size);
      } catch (error) {
        console.error('Error fetching following count:', error);
      }
    };

    if (session) {
      checkFollowing();
      fetchFollowersCount();
      fetchFollowingCount();
    }
  }, [session, id]);


  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const openFollowingModal = async () => {
    setShowFollowingModal(true);
    // Fetch the list of following
    if (session) {
      const followingRef = collection(db, 'users', id, 'following');
      const followingSnapshot = await getDocs(followingRef);
      const followingData = followingSnapshot.docs.map((doc) => doc.data());
      setFollowingList(followingData);
    }
  };

  const closeFollowingModal = () => {
    setShowFollowingModal(false);
  };

  const openFollowersModal = async () => {
    setShowFollowersModal(true);
    // Fetch the list of followers
    const followersRef = collection(db, 'users', id, 'followers');
    const followersSnapshot = await getDocs(followersRef);
    const followersData = followersSnapshot.docs.map((doc) => doc.data());
    setFollowersList(followersData);
  };

  const closeFollowersModal = () => {
    setShowFollowersModal(false);
  };


  const [isCurrentUserVerified, setIsCurrentUserVerified] = useState(false); // Initialize the state

  useEffect(() => {
    // Fetch the user's document and check isVerified
    if (id) {
      const userRef = doc(db, 'users', id);
      getDoc(userRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setIsCurrentUserVerified(userData.isVerified || false);
          }
        })
        .catch((error) => {
          console.error('Error fetching user document:', error);
        });
    }
  }, [id]);


  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] overflow-y-auto no-scrollbar'>
       {/* <h1 className='font-semibold'>{session?.user?.name}</h1> */}
       <div class="mx-auto flex h-screen w-full items-start justify-center bg-white text-sm text-gray-900 antialiased">
  <div class="mx-auto w-full max-w-[600px]">
  {/*  <!-- Name and tweet count header --> */}
    <div class="flex items-center space-x-4 p-1.5">
      <button class="inline-flex items-center justify-center rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 hover:dark:bg-gray-800 hover:dark:text-white" onClick={() => router.push(`/`)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
        </svg>
      </button>
      <div class="flex flex-col items-start">
        <h2 class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">{updatedProfile?.name || session?.user?.name}</h2>
        <span class="text-xs text-gray-500 dark:text-gray-400">{userPosts.length} Writings </span>
      </div>
    </div>

   {/* <!-- Header image --> */}
    <div>
      <img src={updatedProfile?.headerImage ||"https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"} className="w-[100%] h-[190px] mx-auto object-cover" />
    </div>

   {/* <!-- Profile picture and edit button --> */}
    <div class="flex items-start justify-between px-4 py-3">
      <img class="-mt-[4.5rem] h-32 w-32 cursor-pointer rounded-full ring-4 ring-gray-100" src={updatedProfile?.profileImage || 'https://media.idownloadblog.com/wp-content/uploads/2017/03/Twitter-new-2017-avatar-001.png'} />
      {isCurrentUserVerified ? (<div>
       {/* Add a "Message" button/link */}
       {session && session.user.uid !== id && isFollowing && (
          <button className="bg-yellow-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full mt-2 mr-1" onClick={() => router.push(`/conversation/${id}`)}>
           <BiMessageSquareAdd className='text-xl' /> 
          </button>
      )}
      {session && session.user.uid !== id && (
        <button 
           onClick={isFollowing ? unfollowUser : followUser}
           className={`${
            isFollowing
              ? 'bg-yellow-500 text-white' // followed
              : 'bg-yellow-500 text-white' //not followed ------ Use your preferred background and text colors
          } p-2 rounded-full`}
        >
          {/* {isFollowing ? 'Unfollow' : 'follow'} */}
          {isFollowing ? <div className='flex items-center'><RiUserUnfollowFill/> <span className='ml-1'>Unfollow</span> </div> :<div className='flex items-center'><RiUserFollowFill/> <span className='ml-1'>Follow</span> </div>}
        </button>
      )}
      <button
          class="rounded-full border border-gray-300 px-4 py-1.5 font-bold transition duration-150 ease-in-out hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
          onClick={openModal}
          style={{ display: id === session?.user?.uid ? 'block' : 'none' }}
        >
          Edit profile
      </button>
      </div>)
      : (
        <button className='bg-yellow-500 p-2 rounded-[15px] text-white'>Verify</button>
      )}
    </div>
    <UpdateProfileModal isOpen={isModalOpen} onClose={closeModal} />
   {/* <!-- Name and handle --> */}
    <div class="mt-2 px-4">
      <h2 class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">{updatedProfile?.name || session?.user?.name}</h2>
      <span class="text-gray-500 dark:text-gray-400">@{updatedProfile?.tag || session?.user?.tag}</span>
    </div>

   {/* <!-- Bio --> */}
    <div class="mt-4 px-4">
      <span>{updatedProfile?.bio || 'No Bio'}</span>
    </div>

  {/*}  <!-- Location, CTA and join date for large screens --> */}
    <div class="mt-3 hidden md:flex lg:flex items-center space-x-4 px-4 ">
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span class="text-gray-500 dark:text-gray-400">{updatedProfile?.location || 'No Location'} &nbsp;&nbsp;→</span>
      </div>
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <a class="text-sky-500 hover:underline" href={updatedProfile?.website || "#"} target="_blank">{updatedProfile?.website || 'No Website'}</a>
      </div>
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>

        <span class="text-gray-700 dark:text-gray-400">{ updatedProfile?.signupDate || ''}</span>
      </div>
    </div>

    {/*}  <!-- Location, CTA and join date for smaller devices--> */}
    <div className='md:hidden lg:hidden xl:hidden'>
    <div class="mt-3 flex items-center justify-between   space-x-4 px-4 ">
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span class="text-gray-500 dark:text-gray-400">{updatedProfile?.location || 'No Location'}{/* &nbsp;&nbsp;→ */} </span>
      </div>
      <div class="flex items-center space-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>

        <span class="text-gray-700 dark:text-gray-400">{ updatedProfile?.signupDate || ''}</span>
      </div>
      </div>
      <div class="flex items-center space-x-1 p-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <a class="text-sky-500 hover:underline" href={updatedProfile?.website || "#"} target="_blank">{updatedProfile?.website || 'No Website'}</a>
      </div>
      </div>
    

  {/*  <!-- Following/follower count --> */}
    <div class="mt-3 flex items-center space-x-4 px-4">
      <div class="cursor-pointer hover:underline" onClick={openFollowingModal}>
        <span class="font-bold">{followingCount}</span>
        <span class="text-gray-700 dark:text-gray-400">Following</span>
      </div>
      <div class="cursor-pointer hover:underline" onClick={openFollowersModal}>
        <span class="font-bold">{followersCount}</span>
        <span class="text-gray-700 dark:text-gray-400">Followers</span>
      </div>
    </div>

    {showFollowingModal && (
      <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] overflow-y-auto shadow-md `}>
      <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]     overflow-y-auto no-scrollbar h-[380px] md:h-[450px]'>
        
      <div className='flex justify-end'>
        <MdClose className='text-[22px] cursor-pointer ' onClick={closeFollowingModal} />
      </div>

      <h1 className='font-bold text-xl mb-1'>List of Following</h1>
            <ul>
              {followingList.map((user, index) => (
                <li key={index}>
                  
                  <div className='grid grid-cols-[48px,1fr] gap-4 mb-2 border-b border-b-gray-300 p-2 cursor-pointer'>

                  <div onClick={() => router.push(`/users/${user.id}`)}>
                    <img className='h-12 w-12 rounded-full object-cover' src={user?.profileImage} alt="" />
                  </div>
                  <div  className='mt-3' onClick={() => router.push(`/users/${user.id}`)}>
                    <span className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{user.name}</span> - <span className='text-gray-500'><Moment fromNow>{user.dateFollowed.toDate()}</Moment></span>
                  </div>
                  </div>
                  
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showFollowersModal && (
        <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] overflow-y-auto shadow-md `}>
        <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]     overflow-y-auto no-scrollbar h-[380px] md:h-[450px]'>
          
        <div className='flex justify-end'>
        <MdClose className='text-[22px] cursor-pointer ' onClick={closeFollowersModal} />
        </div>

          <h1 className='font-bold text-xl mb-1'>List of Followers</h1>
            <ul>
              {followersList.map((user, index) => (
                <li key={index}>
                  <div className='grid grid-cols-[48px,1fr] gap-4 mb-2 border-b border-b-gray-300 p-2 cursor-pointer' onClick={() => router.push(`/users/${user.id}`)}>

                  <div>
                    <img className='h-12 w-12 rounded-full object-cover' src={user?.profileImage} alt="" />
                  </div>
                  <div  className='mt-3'>
                    <span className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{user.name}</span> - <span className='text-gray-500'><Moment fromNow>{user.dateFollowed.toDate()}</Moment></span>
                  </div>
                  </div>
                </li>
              ))}
            </ul>
            
          </div>
        </div>
      )}

    {/* -- Tabs -- */ }
    <div>
      {/* Tabs */}
      <ul className="mt-3 flex justify-evenly">
        {Object.keys(tabContents).map((tabName) => (
          <li
            key={tabName}
            className={`relative flex w-full cursor-pointer items-center justify-center p-4 transition duration-150 ease-in-out ${
              activeTab === tabName
                ? 'bg-gray-200 dark:bg-yellow-500'
                : 'hover:bg-gray-200 dark:hover:bg-yellow-200'
            }`}
            onClick={() => handleTabClick(tabName)}
          >
            <span
              className={`font-bold ${
                activeTab === tabName ? '' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {tabName}
            </span>
            {activeTab === tabName && (
              <div className="absolute bottom-0 w-14 border-b-[3px] border-sky-500"></div>
            )}
          </li>
        ))}
      </ul>

      {/* Content */}
      <div className="mt-4">{tabContents[activeTab]}</div>
    </div>
  </div>
</div>


    </section>
  )
}

export default ProfilePerson