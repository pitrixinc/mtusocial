import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, where, query, getDocs, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
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
      <h2 className="text-2xl font-semibold mb-4">Group Discovery</h2>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for groups..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="group-card">
            <Link href={`/group/${group.id}`}>
              <a className="block rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transform transition-transform duration-300">
                <img
                  src={group.groupBanner}
                  alt="Group Banner"
                  className="w-full h-48 object-cover"
                />
                <p className="mt-2 text-lg font-medium">{group.title.slice(0, 15)}...</p>
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

    // Fetch joined groups
    const fetchJoinedGroups = async () => {
      try {
        if (!session) return;

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
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto no-scrollbar'>
      <h1 className="text-xl md:text-4xl font-semibold mb-6 border-b border-b-gray-100 shadow-md p-2">My Groups</h1>
      <div className="overflow-x-scroll no-scrollbar">
        <div className="flex flex-wrap -mx-2 mt-2">
          {myGroups.map((group) => (
            <div key={group.id} className="w-1/3 lg:w-1/3 xl:w-1/4 px-4 mb-8 ">
              <Link href={`/group/${group.id}`}>
                <a className="block rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transform transition-transform duration-300 shadow-md ring-offset-2 ring-4 ring-yellow-500">
                  <img
                    src={group.groupBanner}
                    alt="Group Banner"
                    className="w-full h-48 object-cover"
                  />
                  <p className="mt-2 text-sm font-semibold text-center">{group.title.slice(0, 8)}...</p>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {joinedGroups.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Joined Groups</h2>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex flex-wrap -mx-2 mt-2">
              {joinedGroups.map((group) => (
                <div key={group.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-4 mb-8 ">
                <Link href={`/group/${group.id}`}>
                  <a className="block rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transform transition-transform duration-300 shadow-md ring-offset-2 ring-4 ring-yellow-500">
                    <img
                      src={group.groupBanner}
                      alt="Group Banner"
                      className="w-full h-48 object-cover"
                    />
                    <p className="mt-2 text-sm font-semibold text-center">{group.title.slice(0, 8)}...</p>
                  </a>
                </Link>
              </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <GroupDiscovery groups={randomGroups} />
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