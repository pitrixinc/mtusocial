import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, where, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Link from 'next/link';

export default function MyGroups() {
  const { data: session } = useSession();
  const [myGroups, setMyGroups] = useState([]);

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
  }, [session]);

  return (
    <div>
      <h1>My Groups</h1>
      <ul>
        {myGroups.map((group) => (
          <li key={group.id}>
            <Link href={`/group/${group.id}`}>
              <a>
                <img
                  src={group.groupBanner}
                  alt="Group Banner"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                  }}
                />
                <p>{group.title.slice(0, 15)}...</p>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
