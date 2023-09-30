import React, { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useSession } from 'next-auth/react';
import Post from './Post';
import Input from './Input';
import Image from 'next/image';
import mtuLogo from '../assets/images/mtulogo.jpg';
import { HiOutlineSparkles } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { BsNewspaper } from 'react-icons/bs'

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('ForYou'); // Initialize with 'For You'
  const [isCurrentUserVerified, setIsCurrentUserVerified] = useState(false);
  const [followingIsEmpty, setFollowingIsEmpty] = useState(false);
  const [newsIsEmpty, setNewsIsEmpty] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (session) {
        try {
          let postQuery;

          if (activeTab === 'ForYou') {
            // Fetch posts based on your logic for the "For You" tab
            // Replace this with your specific query logic
            postQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
          } else if (activeTab === 'Following') {
            // Fetch posts from users the current user is following
            // Replace this with your specific query logic
            const followingQuery = query(collection(db, 'users', session.user.uid, 'following'));
            const followingSnapshot = await getDocs(followingQuery);
            const followingIds = followingSnapshot.docs.map((doc) => doc.id);

            if (followingIds.length > 0) {
              postQuery = query(
                collection(db, 'posts'),
                where('postedById', 'in', followingIds),
                orderBy('timestamp', 'desc')
              );
            } else {
              // Handle the case where there are no followingIds
              // For example, show a message to follow users.
              setFollowingIsEmpty(true);
            }
          } else if (activeTab === 'News') {
            // Fetch posts where isQualifiedForGoldBadge is true
            postQuery = query(
              collection(db, 'posts'),
              where('isQualifiedForGoldBadge', '==', true),
              orderBy('timestamp', 'desc')
            );
          }

          if (postQuery) {
            const unsubscribe = onSnapshot(postQuery, (snapshot) => {
              const postList = snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
              }));
              setPosts(postList);
              // Check if the News tab is empty
              if (activeTab === 'News' && postList.length === 0) {
                setNewsIsEmpty(true);
              } else {
                setNewsIsEmpty(false);
              }
            });

            return () => {
              // Unsubscribe when component unmounts
              unsubscribe();
            };
          }
        } catch (error) {
          toast.error('Error fetching posts:', error);
        }
      }
    };

    // Fetch the user's document and check isVerified
    if (session && session.user) {
      const userRef = collection(db, 'users');
      const userQuery = query(userRef, where('id', '==', session.user.uid));
      onSnapshot(userQuery, (snapshot) => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setIsCurrentUserVerified(userData.isVerified);
        }
      });
    }

    fetchPosts();
  }, [session, activeTab]);

  return (
    // Your JSX code remains the same
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
      <div className=' top-0 bg-white text-[#16181C] flex justify-between font-bold text-[20px] px-4 py-2 mt-[0px]'>
        Home
        <div className='rounded-[1px] md:hidden lg:hidden'>
          <Image className='rounded-[1px] md:hidden lg:hidden' src={mtuLogo} height='33px' width='29px' />
        </div>
        <HiOutlineSparkles />
      </div>

      <div className='sticky top-0 bg-white text-[#16181C] flex justify-between mx-5 font-semibold text-[16px] px-4 py-2 rounded-[20px] shadow-sm'>
        <div
          className={`cursor-pointer ${
            activeTab === 'ForYou' ? 'text-yellow-500 border-b-2 border-b-yellow-500' : ''
          }`}
          onClick={() => setActiveTab('ForYou')}
        >
          For You
        </div>
        <div
          className={`cursor-pointer ${
            activeTab === 'Following' ? 'text-yellow-500 border-b-2 border-b-yellow-500' : ''
          }`}
          onClick={() => setActiveTab('Following')}
        >
          Following
        </div>
        <div
          className={`cursor-pointer ${
            activeTab === 'News' ? 'text-yellow-500 border-b-2 border-b-yellow-500' : ''
          }`}
          onClick={() => setActiveTab('News')}
        >
          <BsNewspaper/>
        </div>
      </div>
      {isCurrentUserVerified && <Input />}
      {/* Your other components */}
      {isCurrentUserVerified ? (
        <>
          {followingIsEmpty ? (
            <p>You are not following anyone. Follow people to see their posts.</p>
          ) : newsIsEmpty ? ( // Check if News tab is empty
          <p>No News</p>
        )  : posts.length === 0 ? (
            <p>{activeTab === 'News' ? 'No News.' : 'No posts, follow people to see their posts or write a post to view it here.'}</p>
          ) : (
            posts.map((post) => (
              <Post key={post.id} id={post.id} post={post.data} />
            ))
          )}
        </>
      ) : (
        <div className='flex flex-col items-center justify-center min-h-screen'>
          <p className="bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center mb-4">
            Please verify your account to view posts from people and also post as well.
          </p>
          <button className='bg-yellow-500 p-2 rounded-[15px] text-white'>Verify</button>
        </div>
      )}
    </section>
  );
};

export default Feed;
