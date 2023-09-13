import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export default function GroupDetails() {
  const router = useRouter();
  const { groupId } = router.query;
  const [group, setGroup] = useState({});

  useEffect(() => {
    if (!groupId) return;

    // Fetch group details
    const groupRef = doc(db, 'groups', groupId);
    getDoc(groupRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setGroup(docSnap.data());
        } else {
          console.error('Group not found');
          router.push('/'); // Redirect to home or error page
        }
      })
      .catch((error) => {
        console.error('Error fetching group', error);
        router.push('/'); // Redirect to home or error page
      });
  }, [groupId]);
console.log(session.user.uid)
  return (
    <div>
      <h1>Group Details</h1>
      <div>
        <img
          src={group.groupBanner}
          alt="Group Banner"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
          }}
        />
      </div>
      <div>
        <img
          src={group.groupProfilePic}
          alt="Group Profile Picture"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
          }}
        />
      </div>
      <h2>{group.title}</h2>
      <p>{group.description}</p>
      <p>{group.purpose}</p>
    </div>
  );
}
