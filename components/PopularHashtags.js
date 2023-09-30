import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router'; // Import the useRouter hook from Next.js

const PopularHashtags = () => {
  const [popularHashtags, setPopularHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize the useRouter hook

  useEffect(() => {
    // Fetch the top 10 popular hashtags based on their names and counts
    const fetchPopularHashtags = async () => {
      try {
        const hashtagsCollectionRef = collection(db, 'hashtags');
        const querySnapshot = await getDocs(hashtagsCollectionRef);

        const hashtagCounts = new Map(); // Use a Map to count hashtags by name

        querySnapshot.forEach((doc) => {
          const hashtagData = doc.data();
          const hashtagName = hashtagData.name;

          if (hashtagCounts.has(hashtagName)) {
            // Increment the count for this hashtag name
            hashtagCounts.set(hashtagName, hashtagCounts.get(hashtagName) + 1);
          } else {
            // Initialize count to 1 for this hashtag name
            hashtagCounts.set(hashtagName, 1);
          }
        });

        // Convert the Map to an array of objects with name and count properties
        const topHashtags = Array.from(hashtagCounts.entries()).map(
          ([name, count]) => ({
            name,
            count,
          })
        );

        // Sort the hashtags by count in descending order
        topHashtags.sort((a, b) => b.count - a.count);

        // Limit to the top 10 hashtags
        const limitedTopHashtags = topHashtags.slice(0, 10);

        setPopularHashtags(limitedTopHashtags);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching popular hashtags:', error);
      }
    };

    fetchPopularHashtags();
  }, []);

  // Handle the navigation to the hashtag posts page when a popular hashtag is clicked
  const handleHashtagClick = (hashtag) => {
    router.push(`/hashtag-posts?hashtag=${hashtag}`); // Redirect to the hashtag-posts page with the selected hashtag
  };

  return (
    <div className="popular-hashtags-container bg-gray-100 p-2 rounded-lg shadow-sm">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : popularHashtags.length === 0 ? (
        <p className="text-gray-500">No hashtags found.</p>
      ) : (
        <ul>
          {popularHashtags.map((hashtag, index) => (
            <li
              key={index}
              className="text-lg text-gray-700 cursor-pointer hover:underline mb-3"
              onClick={() => handleHashtagClick(hashtag.name)} // Handle the click event
            >
              <span className='text-sm text-gray-500'>Trending Now</span>
             <p className='font-bold text-md'>#{hashtag.name}</p> <span className='text-sm text-gray-500'>{hashtag.count} posts </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PopularHashtags;