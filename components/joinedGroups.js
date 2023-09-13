import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSession } from 'next-auth/react';

function JoinedGroups() {
  const { data: session } = useSession();
  const [joinedGroups, setJoinedGroups] = useState([]);

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
    <div className='mt-4'>
      <h2>Joined Groups</h2>
     <div className='overflow-x-auto'>
      <ul>
        {joinedGroups.map((group) => (
          <li key={group.id}>
            <a>
              <img
                src={group.groupBanner}
                alt="Group Banner"
                className="w-40 h-40 object-cover"
              />
              <p className="mt-2">{group.title.slice(0, 15)}...</p>
            </a>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

export default JoinedGroups;
