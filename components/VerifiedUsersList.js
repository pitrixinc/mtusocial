import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import VerifiedUsers from './VerifiedUsers';
import PopularHashtags from './PopularHashtags';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const ProfileData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleSearch = async () => {
      setIsLoading(true);

      // Define a Firestore query to search for users and groups, make it case insensitive
      const usersQuery = query(collection(db, 'users'), orderBy('name'), limit(10));
      const groupsQuery = query(collection(db, 'groups'), orderBy('title'), limit(10));

      try {
        // Execute the user query and group query in parallel
        const [usersSnapshot, groupsSnapshot] = await Promise.all([
          getDocs(usersQuery),
          getDocs(groupsQuery),
        ]);

        const userResults = usersSnapshot.docs
          .filter((doc) =>
            doc.data().name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((doc) => ({
            type: 'user',
            id: doc.id,
            data: doc.data(),
          }));

        const groupResults = groupsSnapshot.docs
          .filter((doc) =>
            doc.data().title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((doc) => ({
            type: 'group',
            id: doc.id,
            data: doc.data(),
          }));

        // Combine and set the results
        setSearchResults([...userResults, ...groupResults]);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery.length > 0) {
      handleSearch();
    } else {
      // Clear search results when the query is empty
      setSearchResults([]);
    }
  }, [searchQuery]);

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
    <div className='hidden lg:block w-[350px] mt-2 h-screen overflow-y-auto no-scrollbar'>
       {isVerified ? ( <>
      <div className='bg-gray-200 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10'>
        <FiSearch />
        <input
          className='bg-transparent w-[100%] outline-none'
          type='text'
          placeholder='Search MTU Social'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div> </>) : ( <>
      <div className='bg-gray-200 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10'>
        <FiSearch />
        <input
          className='bg-transparent w-[100%] outline-none'
          type='text'
          placeholder='Verify to search'
          disabled
        />
      </div> </>)}

      <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4 sticky top-1 z-10 h-full'>
        {isLoading ? (
         <div className='flex items-center justify-center gap-1'>
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
        ) : (
          <>
            {searchResults.map((result) => (
               <div key={result.id} className='flex items-center mt-2 cursor-pointer border-b border-gray-300 p-2'>
               {result.type === 'user' && (
                 <Link href={`/users/${result.id}`}>
                   {/* Wrap the user element with Link */}
                   <a className='flex items-center'>
                     <img
                       src={result.data.profileImage}
                       alt={`${result.data.name}'s profile`}
                       className='w-12 h-12 rounded-full mr-2'
                     />
                     <p className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>
                       {result.data.name.length > 17
                         ? result.data.name.slice(0, 17) + '...'
                         : result.data.name}
                     </p>
                   </a>
                 </Link>
               )}
               {result.type === 'group' && (
                 <Link href={`/group/${result.id}`}>
                   {/* Wrap the group element with Link */}
                   <a className='flex items-center'>
                     <img
                       src={result.data.groupProfilePic}
                       alt={`${result.data.title}'s profile`}
                       className='w-12 h-12 rounded-full mr-2'
                     />
                     <p className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>
                       {result.data.title.length > 17
                         ? result.data.title.slice(0, 17) + '...'
                         : result.data.title}
                     </p>
                   </a>
                 </Link>
               )}
               <div className='ml-4 w-[50px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 flex items-center justify-center'>
                 {result.type === 'user' ? (
                   <div className='ml-4 w-[55px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 bg-blue-100 hover:bg-blue-500 hover:text-white text-gray-400 flex items-center justify-center'>
                     User
                   </div>
                 ) : (
                    <div className='ml-4 w-[55px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 bg-green-100 hover:bg-green-500 hover:text-white text-gray-400 flex items-center justify-center'>
                     Group
                   </div>
                 )}
               </div>
             </div>
            ))}
          </>
        )} 
            <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4'>
                <h1 className='text-[#16181C] font-bold text-[20px]'>Popular Hashtags</h1>
                <PopularHashtags />
            </div>

            <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4 top-1 z-10 h-full sticky'>
                <h1 className='text-[#16181C] font-bold text-[20px]'>Suggested Users</h1>
                {isVerified ? ( <>
                <VerifiedUsers />
                </>) : (<div className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center'> Please verify to view other verified users </div>)}

            </div>
            
      </div>
    </div>
  );
};

export default ProfileData;





{/*
import React from 'react'
import { FiSearch } from "react-icons/fi"
import VerifiedUsers from './VerifiedUsers'

const VerifiedUsersList = () => {
    return (

        <div className='hidden lg:block w-[350px] mt-2 h-screen overflow-y-auto no-scrollbar'>

            <div className='bg-white flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10 '>
                <FiSearch />
                <input className='bg-transparent w-[100%] outline-none' type="text" placeholder='Search Twitter' />
            </div>


            <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4 top-1 z-10 h-full sticky'>
                <h1 className='text-[20px] font-medium'>Suggested Users</h1>

                <VerifiedUsers />

            </div>

        </div>
    )
}

export default VerifiedUsersList
*/}