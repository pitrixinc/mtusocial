import React, { useEffect, useState, useRef } from 'react';
import { onSnapshot, collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useSession } from 'next-auth/react';
import Post from './Post';
import Input from './Input';
import Image from 'next/image';
import mtuLogo from '../assets/images/mtulogo.jpg';
import { HiOutlineSparkles } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { BsNewspaper } from 'react-icons/bs';
import { useRouter } from 'next/router'



// ScrollToTopButton component
const ScrollToTopButton = ({ isVisible, onClick }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 p-2 bg-white text-yellow-500 rounded-full shadow-md cursor-pointer ${
        isVisible ? 'visible' : 'hidden'
      }`}
      onClick={onClick}
    >
     New Posts ▲
    </div>
  );
};




const Feed = () => {
  const [posts, setPosts] = useState([]);
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('ForYou');
  const [isCurrentUserVerified, setIsCurrentUserVerified] = useState(false);
  const [followingIsEmpty, setFollowingIsEmpty] = useState(false);
  const [newsIsEmpty, setNewsIsEmpty] = useState(false);
  const [showMore, setShowMore] = useState(20); // Number of additional posts to show
  const [isNewPostsAvailable, setIsNewPostsAvailable] = useState(false);
  const postContainerRef = useRef(null);
  const latestPostTimestampRef = useRef(null);
  const router = useRouter()

  useEffect(() => {
    const fetchPosts = async () => {
      if (session) {
        try {
          let postQuery;

          if (activeTab === 'ForYou') {
            postQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
          } else if (activeTab === 'Following') {
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
              setFollowingIsEmpty(true);
            }
          } else if (activeTab === 'News') {
            const followingQuery = query(collection(db, 'users', session.user.uid, 'following'));
            const followingSnapshot = await getDocs(followingQuery);
            const followingIds = followingSnapshot.docs.map((doc) => doc.id);

            if (followingIds.length > 0) {
              postQuery = query(
                collection(db, 'posts'),
                where('postedById', 'in', followingIds),
                where('isQualifiedForGoldBadge', '==', true),
                orderBy('timestamp', 'desc')
              );
            } else {
              setFollowingIsEmpty(true);
            }
          }

          if (postQuery) {
            const unsubscribe = onSnapshot(postQuery, (snapshot) => {
              const postList = snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
              }));

              // Check for new posts
              if (latestPostTimestampRef.current) {
                const newPosts = postList.filter(
                  (post) => post.data.timestamp > latestPostTimestampRef.current
                );
                if (newPosts.length > 0) {
                  setIsNewPostsAvailable(true);
                }
              }
               // Set the latest post timestamp
               if (postList.length > 0) {
                latestPostTimestampRef.current = postList[0].data.timestamp;
              }

              setPosts(postList);

              if (activeTab === 'News' && postList.length === 0) {
                setNewsIsEmpty(true);
              } else {
                setNewsIsEmpty(false);
              }
              
            });

            return () => {
              unsubscribe();
            };
          }
        } catch (error) {
          toast.error('Error fetching posts:', error);
        }
      }
    };

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
  }, [session, activeTab, showMore]);

  const scrollToTop = () => {
    if (postContainerRef.current) {
      postContainerRef.current.scrollTop = 0;
    }
    setIsNewPostsAvailable(false);
  };

  const showMorePosts = () => {
    setShowMore((prevShowMore) => prevShowMore + 20);
  };

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
      <div className='top-0 bg-white text-[#16181C] flex justify-between font-bold text-[20px] px-4 py-2 mt-[0px]'>
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
          onClick={() => {
            setActiveTab('News');
            scrollToTop();
          }}
        >
          <BsNewspaper />
        </div>
      </div>
      {isCurrentUserVerified && <Input />}
      <div ref={postContainerRef} className='px-4 pt-2'>

        {isCurrentUserVerified ? (
          <>
            {followingIsEmpty ? (
              <p>You are not following anyone. Follow people to see their posts.</p>
            ) : newsIsEmpty ? (
              <p>No News</p>
            ) : (
              posts.slice(0, showMore).map((post) => (
                <Post key={post.id} id={post.id} post={post.data} />
              ))
            )}
            {isNewPostsAvailable && (
              <ScrollToTopButton isVisible={isNewPostsAvailable} onClick={scrollToTop} />
            )}
            {posts.length > showMore && (
              <div className='text-center mt-3 mb-[60px]'>
                <button className='text-yellow-500' onClick={showMorePosts}>
                  Show Another 20 Posts
                </button>
              </div>
            )}
            
          </>
        ) : (
          <div className='flex flex-col items-center justify-center min-h-screen'>
            <p className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center mb-4'>
              Please verify your account to view posts from people and also post as well.
            </p>
            <button className='bg-yellow-500 p-2 rounded-[15px] text-white' onClick={() => router.push('/verify')}>Verify</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Feed;
