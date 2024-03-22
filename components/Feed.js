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
import Typewriter from "typewriter-effect";


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
  const [loading, setLoading] = useState(true); // State to track loading status
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
      postContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    setIsNewPostsAvailable(false);
  };
  

  const showMorePosts = () => {
    setShowMore((prevShowMore) => prevShowMore + 20);
  };

  // Use useEffect to simulate loading time
  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false); // Set loading to false after a simulated delay
    }, 1000); // Adjust the delay time as needed

    return () => clearTimeout(delay);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  
// Determine the greeting based on the current time
let greeting;
if (currentTime.getHours() >= 5 && currentTime.getHours() < 12) {
  greeting = "Good Morning";
} else if (currentTime.getHours() >= 12 && currentTime.getHours() < 17) {
  greeting = "Good Afternoon";
} else if (currentTime.getHours() >= 17 && currentTime.getHours() < 21) {
  greeting = "Good Evening";
} else {
  greeting = "Good Night";
}


  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
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
      {loading ? (<>
        
        <div className='flex flex-col gap-1 items-center justify-center min-h-screen'>
          <div className='items-center justify-center w-14 h-14 hoverEffect p-0 mb-4'>
              <Image className='rounded-[1px]' src={mtuLogo} height="74px" width="64px" />
          </div>
          <div className='flex flex-row'>
            <div
                class="bg-gradient-to-r from-yellow-500 to-black  w-4 h-4 rounded-full animate-bounce first-circle"
                style={{ animationDelay: '0.1s', }}
                ></div>
                <div
                class="bg-gradient-to-r from-yellow-500 to-black  w-4 h-4 rounded-full animate-bounce second-circle"
                style={{ animationDelay: '0.2s', }}
                ></div>
                <div
                class="bg-gradient-to-r from-yellow-500 to-black  w-4 h-4 rounded-full animate-bounce third-circle"
                style={{ animationDelay: '0.3s', }}
                ></div>
            </div>
         </div>
      </>) : (<>
      {isCurrentUserVerified && (<>
        <p className="text-base text-center leading-6 font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black  p-4 rounded-md shadow-sm">
        <Typewriter 
           options={{
               strings : [
                `${greeting}, ${session?.user?.name}!`,
                `Dear ${session?.user?.name}, believe in yourself; your potential is limitless, aim high.`,
                `Dear ${session?.user?.name}, embrace failure; it's a stepping stone to success, learn.`,
                `Dear ${session?.user?.name}, persist through challenges; resilience breeds victory, keep moving forward.`,
                `Dear ${session?.user?.name}, stay focused on your goals; distractions deter progress, prioritize.`,
                `Dear ${session?.user?.name}, find joy in the journey; each step counts, cherish moments.`,
                `Dear ${session?.user?.name}, never settle for mediocrity; strive for excellence, aim higher.`,
                `Dear ${session?.user?.name}, trust your instincts; intuition guides wise decisions, listen closely.`,
                `Dear ${session?.user?.name}, seek opportunities in setbacks; adversity fuels growth, adapt.`,
                `Dear ${session?.user?.name}, celebrate small wins; they pave the way to big achievements, appreciate.`,
                `Dear ${session?.user?.name}, surround yourself with positivity; energy is contagious, radiate light.`,
                `Dear ${session?.user?.name}, practice gratitude daily; blessings abound, count them joyfully.`,
                `Dear ${session?.user?.name}, be kind to yourself; self-love nurtures inner strength, embrace flaws.`,
                `Dear ${session?.user?.name}, dream big dreams; imagination shapes reality, dare greatly.`,
                `Dear ${session?.user?.name}, forge your path; uniqueness defines success, be authentic.`,
                `Dear ${session?.user?.name}, speak your truth; honesty breeds trust, integrity matters.`,
                `Dear ${session?.user?.name}, take calculated risks; courage leads to breakthroughs, leap fearlessly.`,
                `Dear ${session?.user?.name}, forgive past hurts; freedom lies in letting go, release burdens.`,
                `Dear ${session?.user?.name}, stay humble in victory; grace wins hearts, show gratitude.`,
                `Dear ${session?.user?.name}, embrace change; growth thrives in transition, adapt gracefully.`,
                `Dear ${session?.user?.name}, serve others selflessly; kindness transforms lives, give generously.`,
                `Dear ${session?.user?.name}, stay resilient in adversity; storms pass, strength endures, endure.`,
                `Dear ${session?.user?.name}, practice patience; timing is key, trust the process, wait.`,
                `Dear ${session?.user?.name}, invest in personal development; knowledge empowers, learn continuously.`,
                `Dear ${session?.user?.name}, cultivate resilience; setbacks build character, bounce back stronger.`,
                `Dear ${session?.user?.name}, value relationships; love and connection enrich life's journey, cherish.`,
                `Dear ${session?.user?.name}, find purpose in passion; fulfillment lies in doing what ignites your soul, pursue.`,
                `Dear ${session?.user?.name}, embrace discomfort; growth resides outside your comfort zone, expand.`,
                `Dear ${session?.user?.name}, be a lifelong learner; wisdom comes from curiosity, seek knowledge.`,
                `Dear ${session?.user?.name}, stay committed to excellence; mediocrity is the enemy, strive for greatness.`,
                `Dear ${session?.user?.name}, believe in miracles; faith moves mountains, miracles happen, trust.`,
                `Dear ${session?.user?.name}, nurture inner peace; tranquility is found within, seek stillness.`,
                `Dear ${session?.user?.name}, inspire others with your actions; lead by example, shine brightly.`,
                `Dear ${session?.user?.name}, embrace failures as lessons; setbacks are stepping stones to success, learn.`,
                `Dear ${session?.user?.name}, visualize success; manifest your dreams into reality, envision greatness.`,
                `Dear ${session?.user?.name}, set boundaries; protect your energy, prioritize self-care, value yourself.`,
                `Dear ${session?.user?.name}, rise above negativity; positivity is contagious, spread joy wherever you go.`,
                `Dear ${session?.user?.name}, celebrate progress, not perfection; every step forward is a victory, acknowledge growth.`,
                `Dear ${session?.user?.name}, stay true to your values; integrity is your compass, follow it unwaveringly.`,
                `Dear ${session?.user?.name}, transform obstacles into opportunities; resilience is the key, adapt and overcome.`,
                `Dear ${session?.user?.name}, leave a legacy of kindness; compassion echoes through generations, be a light.`,
                `Dear ${session?.user?.name}, live with purpose; passion fuels purpose, pursue meaningful endeavors.`,
                `Dear ${session?.user?.name}, seek wisdom in adversity; challenges are lessons in disguise, learn and grow.`,
                `Dear ${session?.user?.name}, stay committed to your vision; persistence conquers all, never give up.`,
                  `Dear ${session?.user?.name}, cultivate an attitude of gratitude; appreciation magnifies blessings, count your joys.`,
                  `Dear ${session?.user?.name}, radiate positivity; optimism is contagious, brighten the world with your smile.`,
                  `Dear ${session?.user?.name}, practice self-reflection; introspection leads to self-awareness, know thyself deeply.`,
                  `Dear ${session?.user?.name}, dream fearlessly; imagination knows no bounds, envision limitless possibilities.`,
                  `Dear ${session?.user?.name}, embrace diversity; inclusivity fosters unity, celebrate differences, embrace diversity.`,
                  `Dear ${session?.user?.name}, create your own path; innovation thrives in originality, dare to be different.`,
                  `Dear ${session?.user?.name}, live in the present moment; yesterday is history, tomorrow is a mystery, cherish today.`
               
            ],            
              autoStart: true,
              loop: true,
           }}
           />
           </p>
      <Input />    
      </>)}
      <div ref={postContainerRef} className='px-4 pt-2'>
      {isNewPostsAvailable && (
              <div className='fixed w-full top-0 text-center bg-white py-2'>
                <button className='text-yellow-500' onClick={scrollToTop}>
                  New Posts ▲
                </button>
              </div>
            )}
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
      </div> </>)}
    </section>
  );
};

export default Feed;
