import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Post from '../components/Post'; // Import your Post component
import { useSession } from 'next-auth/react';

const HashtagPosts = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { hashtag } = router.query; // Retrieve the hashtag from query parameters
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [errorMessage, setErrorMessage] = useState('');
  let unsubscribe = null;

  useEffect(() => {
    if (hashtag) {
      const fetchPosts = async () => {
        try {
          // Query for posts with the specified hashtag name in the "hashtags" collection
          const hashtagsCollectionRef = collection(db, 'hashtags');
          const hashtagQuery = query(
            hashtagsCollectionRef,
            where('name', '==', hashtag)
          );

          const postIds = [];

          // Use onSnapshot to listen for changes in the hashtag collection
          unsubscribe = onSnapshot(hashtagQuery, (snapshot) => {
            postIds.length = 0; // Clear the array before repopulating

            snapshot.forEach((doc) => {
              // Collect post IDs associated with the hashtag
              postIds.push(doc.data().postId);
            });

           // console.log('Post IDs related to the hashtag:', postIds); // Log post IDs

            // Fetch the posts based on the collected post IDs
            const postsCollectionRef = collection(db, 'posts');

            // Create an array of promises to fetch the posts
            const postPromises = postIds.map(async (postId) => {
              const postDoc = await getDoc(doc(postsCollectionRef, postId));
              if (postDoc.exists()) {
                return {
                  id: postDoc.id,
                  username: postDoc.data().username,
                  userImg: postDoc.data().userImg,
                  tag: postDoc.data().tag,
                  text: postDoc.data().text,
                  image: postDoc.data().image,
                  video: postDoc.data().video,
                  timestamp: postDoc.data().timestamp,
                };
              }
              return null;
            });

            // Wait for all promises to resolve
            Promise.all(postPromises).then((fetchedPosts) => {
              // Filter out null values (posts that don't exist)
              const filteredPosts = fetchedPosts.filter((post) => post !== null);
              setPosts(filteredPosts);
              setLoading(false);
            });
          });
        } catch (error) {
          console.error('Error fetching hashtag posts:', error);
        }
      };

      fetchPosts();
    }

    // Cleanup function to unsubscribe when component unmounts or when hashtag changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hashtag]);

  // Function to handle search and update the URL query
  const handleSearch = () => {

     // Clear previous error message on search
     setErrorMessage('');

    // Check if the search query meets the length requirement
    if (searchQuery.length < 3) {
      setErrorMessage('Your search input should be at least three letters');
      setLoading(false);
      return;
    }

    // Check if the search query contains any special characters
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (specialCharacters.test(searchQuery)) {
      setErrorMessage('No special character is allowed');
      setLoading(false);
      return;
    }

    router.push({
      pathname: '/hashtag-posts',
      query: { hashtag: searchQuery }, // Update the hashtag query
    });
  };

  const [isVerified, setIsVerified] = useState(false); // Add state for user verification
  useEffect(() => {
    const fetchUserVerification = async () => {
      if (session) {
        // Check if the user is verified (you might need to adjust the condition)
        const userDoc = doc(db, 'users', session.user.uid);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        
        if (userData && userData.isVerified) {
          setIsVerified(true);
          // Fetch conversations if the user is verified
          
        }
      }
    };

    fetchUserVerification();
  }, [session]);

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      {loading ? (
         <div className='flex items-center justify-center gap-1 py-10'>
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
        ) : ( <>
        {isVerified ? (<>
      <h1 className="text-2xl text-center justify-between font-semibold mb-4 shadow-sm">
        Posts with #{hashtag}
      </h1>

     
      <div className="bg-gray-200 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10 justify-between mx-3">
        <input
          type="text"
          placeholder="Search Hashtag"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent w-[100%] outline-none"
        />
        <button
          onClick={handleSearch}
          className="border-l border-l-gray-400 px-1"
        >
          Search
        </button>
      </div>

      {errorMessage ? (
            <div className='text-red-500 font-bold mb-4'>{errorMessage}</div>
          ) : loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>No posts found for #{hashtag}.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {session && (
            <>
              {posts.map((post) => (
                <Post key={post.id} id={post.id} post={post} />
              ))}
            </>
          )}
        </div>
      )} </>) : (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <p className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center mb-4'>
              Please verify your account to view posts from people and also post as well.
            </p>
            <button className='bg-yellow-500 p-2 rounded-[15px] text-white' onClick={() => router.push('/verify')}>Verify</button>
          </div>
      )}</>)}
    </div>
  );
};

export default HashtagPosts;
