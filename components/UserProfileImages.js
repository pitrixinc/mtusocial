import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Post from '../components/Post';

const UserProfileImages = () => {
  const router = useRouter();
  const { id } = router.query;
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        if (id) {
          const q = query(collection(db, 'posts'), where('id', '==', id)); // Use 'userId' instead of 'id'
          const querySnapshot = await getDocs(q);

          const posts = [];
          querySnapshot.forEach((doc) => {
            const post = {
              id: doc.id,
              // Add other post data fields as needed
              image: doc.data().image,
            };
            posts.push(post);
          });

          setUserPosts(posts);
          setIsLoading(false);
        } else {
          // Handle the case where 'id' is not available
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
        setIsLoading(false); // Set loading to false in case of an error
      }
    };

    fetchUserPosts();
  }, [id]);

  return (
    <div className='bg-gray-100'>
      {isLoading ? (
        <p className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center'>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 bg-gray-100">
          {userPosts.length === 0 ? (
            <p className="bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center">No post</p>
          ) : (
            userPosts.map((post) => (<>
            {post.image && (
              <div key={post.id} className="relative group bg-gray-100 hover:opacity-80 overflow-hidden rounded-md shadow-md cursor-pointer" onClick={() => router.push(`/posts/${post.id}`)}>
                
                  <img src={post.image} alt={`Image for post ${post.id}`} className="w-full h-[85px] object-cover" />
                
              </div>
              )}</>))
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileImages;
