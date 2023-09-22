import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import Link from 'next/link';

const ProfileData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tab state to switch between "Users" and "Groups"
  const [activeTab, setActiveTab] = useState('Users');

  useEffect(() => {
    const handleSearch = async () => {
      setIsLoading(true);

      // Define Firestore queries for users and groups
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

        // Set user and group search results
        setUserResults(userResults);
        setGroupResults(groupResults);
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
      setUserResults([]);
      setGroupResults([]);
    }
  }, [searchQuery]);

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
      <div className='bg-gray-200 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10'>
        <FiSearch />
        <input
          className='bg-transparent w-[100%] outline-none'
          type='text'
          placeholder='Search MTU Social'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4 top-1 z-10 h-full'>
        {isLoading ? (
          // Loading indicator
          <div className='flex items-center justify-center gap-1'>
            <div
              className="bg-gradient-to-r from-yellow-500 to-black w-4 h-4 rounded-full animate-bounce first-circle"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="bg-gradient-to-r from-yellow-500 to-black w-4 h-4 rounded-full animate-bounce second-circle"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="bg-gradient-to-r from-yellow-500 to-black w-4 h-4 rounded-full animate-bounce third-circle"
              style={{ animationDelay: '0.3s' }}
            ></div>
          </div>
        ) : (
          <>
            {/* Horizontal tabs */}
            <div className='flex justify-between mb-2'>
              <div
                className={`cursor-pointer ${
                  activeTab === 'Users' ? 'text-blue-500' : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('Users')}
              >
                Users
              </div>
              <div
                className={`cursor-pointer ${
                  activeTab === 'Groups' ? 'text-green-500' : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('Groups')}
              >
                Groups
              </div>
            </div>
            {/* Users tab */}
            {activeTab === 'Users' && (
              <div>
                {userResults.length > 0 ? (
                  userResults.map((result) => (
                    <div key={result.id} className='flex items-center mt-2 cursor-pointer border-b border-gray-300 p-2'>
                      <Link href={`/users/${result.id}`}>
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
                      <div className='ml-4 w-[50px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 flex items-center justify-center'>
                        <div className='ml-4 w-[55px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 bg-blue-100 hover:bg-blue-500 hover:text-white text-gray-400 flex items-center justify-center'>
                          User
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-gray-500'>No users found</div>
                )}
              </div>
            )}
            {/* Groups tab */}
            {activeTab === 'Groups' && (
              <div>
                {groupResults.length > 0 ? (
                  groupResults.map((result) => (
                    <div key={result.id} className='flex items-center mt-2 cursor-pointer border-b border-gray-300 p-2'>
                      <Link href={`/groups/${result.id}`}>
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
                      <div className='ml-4 w-[50px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 flex items-center justify-center'>
                        <div className='ml-4 w-[55px] h-5 text-sm py-1 px-1 rounded-[5px] mr-2 bg-green-100 hover:bg-green-500 hover:text-white text-gray-400 flex items-center justify-center'>
                          Group
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-gray-500'>No groups found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileData;
