import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, where, query, getDocs, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import Link from 'next/link';
import { MdOutlineAddCircleOutline, MdVerified } from 'react-icons/md';
import { useRouter } from 'next/router'
import { FiSearch } from 'react-icons/fi';

// Function to shuffle an array randomly
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Component to display random groups in a grid
function GroupDiscovery({ groups }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(groups);

  // Function to handle search input change
  const handleSearchInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter groups based on the search query
    const filtered = groups.filter((group) => {
      const title = group.title.toLowerCase();
      const description = group.description.toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    setFilteredGroups(filtered);
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 mx-3">Group Discovery</h2>
      {/* Search input */}
      <div className='bg-gray-200 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] mx-4'>
        <FiSearch className='text-gray-400' />
        <input
          type="text"
          placeholder="Search for groups..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className='bg-transparent w-[100%] outline-none'
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-3 mx-3">
        {filteredGroups.map((group) => (
          <div key={group.id} className="group-card">
            <Link href={`/group/${group.id}`}>
              <a className="block rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transform transition-transform duration-300 shadow-md ring-offset-2 ring-4 ring-yellow-500">
                <img
                  src={group.groupBanner}
                  alt="Group Banner"
                  className="w-full h-48 object-cover"
                />
                <div className='flex items-center justify-center text-center'>
                    <p className="mt-2 text-sm font-semibold text-center">{group.title.slice(0, 8)}...</p> {group?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-2 ml-1" />) } {group?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-2 ml-1" />) }
                </div>
                </a>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MyGroups() {
  const { data: session } = useSession();
  const router = useRouter()
  const [myGroups, setMyGroups] = useState([]);
  const [randomGroups, setRandomGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!session) return;

    // Fetch groups created by the current user
    const groupsRef = collection(db, 'groups');
    const groupsQuery = query(
      groupsRef,
      where('creatorId', '==', session.user.uid)
    );

    getDocs(groupsQuery)
      .then((snapshot) => {
        const myGroupsData = [];
        snapshot.forEach((doc) => {
          myGroupsData.push(doc.data());
        });
        setMyGroups(myGroupsData);
      })
      .catch((error) => {
        console.error('Error fetching user groups', error);
      });

    // Fetch random groups (e.g., the first 6 groups in the system)
    getDocs(collection(db, 'groups'))
      .then((snapshot) => {
        const allGroupsData = [];
        snapshot.forEach((doc) => {
          allGroupsData.push(doc.data());
        });
        const shuffledGroups = shuffleArray(allGroupsData);
        const randomGroupsSlice = shuffledGroups.slice(0, 6); // Display 6 random groups
        setRandomGroups(randomGroupsSlice);
      })
      .catch((error) => {
        console.error('Error fetching random groups', error);
      });

    // Fetch joined groups
    const fetchJoinedGroups = async () => {
      try {
      const groupsCollectionRef = collection(db, 'groups');
      const querySnapshot = await getDocs(groupsCollectionRef);

      const groups = [];
      for (const groupDoc of querySnapshot.docs) {
        const groupData = groupDoc.data();
        // Check if the current user is a member of the group
        const membersCollectionRef = collection(db, 'groups', groupDoc.id, 'members');
        const memberDocRef = doc(membersCollectionRef, session.user.uid);
        const memberDocSnap = await getDoc(memberDocRef);

        if (memberDocSnap.exists()) {
          groups.push({
            id: groupDoc.id,
            title: groupData.title,
            description: groupData.description,
            groupBanner: groupData.groupBanner,
            // Add other properties you want to display
          });
        }
      }

      setJoinedGroups(groups);
      } catch (error) {
        console.error('Error fetching joined groups:', error);
      }}

    fetchJoinedGroups();
  }, [session]);

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
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] overflow-y-auto no-scrollbar'>
      <div className='sticky top-0 z-10 bg-white font-medium text-[20px] px-4 py-2 flex justify-between shadow-md border-b border-b-gray-100'>
         <h1 className="text-xl font-semibold text-gray-800">All Groups</h1>
         <div onClick={() => router.push('/create-group')}>
         <MdOutlineAddCircleOutline className='text-2xl text-yellow-500 cursor-pointer' />
         </div>
      </div>

      {isVerified && <GroupDiscovery groups={randomGroups} />}
      
      <h1 className="text-xl md:text-xl font-semibold mb-1 mt-6 p-2">My Groups</h1>
      <div className="overflow-x-scroll no-scrollbar">
        <div className="flex flex-wrap -mx-2 mt-2">
          {isVerified && myGroups.length > 0 ? (
            myGroups.map((group) => (
              <div key={group.id} className="w-1/2 lg:w-1/3 xl:w-1/4 px-4 mb-8">
                <Link href={`/group/${group.id}`}>
                  <a className="block rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transform transition-transform duration-300 shadow-md ring-offset-2 ring-4 ring-yellow-500">
                    <img
                      src={group.groupBanner}
                      alt="Group Banner"
                      className="w-full h-48 object-cover"
                    />
                    <div className='flex items-center justify-center text-center'>
                    <p className="mt-2 text-sm font-semibold text-center">{group.title.slice(0, 8)}...</p> {group?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-2 ml-1" />) } {group?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-2 ml-1" />) }
                    </div>
                  </a>
                </Link>
              </div>
            ))
          ) : (
            <div className="w-full text-center font-semibold text-gray-500 mt-10">
              {isVerified ? 'You have not created any groups yet.' : 'Please verify your account to see your groups.'}
            </div>
          )}
        </div>
      </div>
      {joinedGroups.length > 0 && (
  <section className="mt-8 mb-[60px]">
    <h2 className="text-xl font-semibold mb-4 mx-3">Joined Groups</h2>
    <div className="flex overflow-x-auto no-scrollbar">
      {joinedGroups.map((group) => (
        <div key={group.id} className="w-44 h-45 lg:h-52 lg:w-42 xl:w-30 xl:h-60 mr-4 flex-shrink-0">
          <Link href={`/group/${group.id}`}>
            <a className="block rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transform transition-transform duration-300 shadow-md ring-offset-2 ring-4 ring-yellow-500">
              <img
                src={group.groupBanner}
                alt="Group Banner"
                className="w-full h-40 object-cover"
              />
              <div className='flex items-center justify-center text-center'>
                    <p className="mt-2 text-sm font-semibold text-center">{group.title.slice(0, 8)}...</p> {group?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-2 ml-1" />) } {group?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-2 ml-1" />) }
              </div>
              </a>
          </Link>
        </div>
      ))}
    </div>
  </section>
)}

    </section>
  );
}





  













{/*}
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, where, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Link from 'next/link';

// Function to shuffle an array randomly
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Component to display random groups in a grid
function GroupDiscovery({ groups }) {
  return (
    <section className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Group Discovery</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="group-card">
            <Link href={`/group/${group.id}`}>
              <a>
                <img
                  src={group.groupBanner}
                  alt="Group Banner"
                  className="w-full h-40 object-cover"
                />
                <p className="mt-2">{group.title.slice(0, 15)}...</p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
} 


function JoinGroups({groups}) {
  return (
    <section className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Groups You Joined</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="group-card">
            <Link href={`/group/${group.id}`}>
              <a>
                <img
                  src={group.groupBanner}
                  alt="Group Banner"
                  className="w-full h-40 object-cover"
                />
                <p className="mt-2">{group.title.slice(0, 15)}...</p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

  
export default function MyGroups() {
  const { data: session } = useSession();
  const [myGroups, setMyGroups] = useState([]);
  const [randomGroups, setRandomGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);

  useEffect(() => {
    if (!session) return;

    // Fetch groups created by the current user
    const groupsRef = collection(db, 'groups');
    const groupsQuery = query(
      groupsRef,
      where('creatorId', '==', session.user.uid)
    );

    getDocs(groupsQuery)
      .then((snapshot) => {
        const myGroupsData = [];
        snapshot.forEach((doc) => {
          myGroupsData.push(doc.data());
        });
        setMyGroups(myGroupsData);
      })
      .catch((error) => {
        console.error('Error fetching user groups', error);
      });

    // Fetch random groups (e.g., the first 6 groups in the system)
    getDocs(collection(db, 'groups'))
      .then((snapshot) => {
        const allGroupsData = [];
        snapshot.forEach((doc) => {
          allGroupsData.push(doc.data());
        });
        const shuffledGroups = shuffleArray(allGroupsData);
        const randomGroupsSlice = shuffledGroups.slice(0, 6); // Display 6 random groups
        setRandomGroups(randomGroupsSlice);
      })
      .catch((error) => {
        console.error('Error fetching random groups', error);
      });

  }, [session]);


  useEffect(() => {
    if (!session) return;

    const fetchJoinedGroups = async () => {
      try {
        const groupsCollectionRef = collection(db, 'groups');
        const querySnapshot = await getDocs(groupsCollectionRef);

        const groups = [];
        querySnapshot.forEach(async (groupDoc) => {
          const groupData = groupDoc.data();
          // Check if the current user is a member of the group
          const membersCollectionRef = collection(db, 'groups', groupDoc.id, 'members');
          const memberDocRef = doc(membersCollectionRef, session.user.uid);
          const memberDocSnap = await getDoc(memberDocRef);

          if (memberDocSnap.exists()) {
            groups.push({
              id: groupDoc.id,
              title: groupData.title,
              description: groupData.description,
              groupBanner: groupData.groupBanner,
              // Add other properties you want to display
            });
          }
        });

        setJoinedGroups(groups);
      } catch (error) {
        console.error('Error fetching joined groups:', error);
      }
    };

    fetchJoinedGroups();
  }, [session]);


  return (
    <section className="sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto no-scrollbar">
      <div className="h-screen overflow-y-auto no-scrollbar">
        <div className="px-4 py-2">
          <h1 className="text-2xl font-semibold mb-2">My Groups</h1>
          <div className="overflow-x-auto">
            <ul className="flex space-x-4">
              {myGroups.map((group) => (
                <li key={group.id} className="mb-4">
                  <Link href={`/group/${group.id}`}>
                    <a>
                      <img
                        src={group.groupBanner}
                        alt="Group Banner"
                        className="w-40 h-40 object-cover"
                      />
                      <p className="mt-2">{group.title.slice(0, 15)}...</p>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <GroupDiscovery groups={randomGroups} />
        <JoinGroups groups={joinedGroups} />
      </div>
    </section>
  );
}
*/}