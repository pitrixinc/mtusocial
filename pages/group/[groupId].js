import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useSession } from 'next-auth/react';

export default function Group() {
  const router = useRouter();
  const { groupId } = router.query;
  const [group, setGroup] = useState({});
  const [isMember, setIsMember] = useState(false);
  const [password, setPassword] = useState('');
  const { data: session } = useSession();

  const joinGroup = async () => {
    try {
      if (group.private && group.password !== password) {
        alert('Incorrect group password');
        return;
      }

      // Check if the user is already a member
      const membersCollectionRef = collection(db, 'groups', groupId, 'members');
      const memberDocRef = doc(membersCollectionRef, session?.user.uid);
      const memberDocSnap = await getDoc(memberDocRef);

      if (!memberDocSnap.exists()) {
        // Add the user to the group's members list
        await setDoc(memberDocRef, {
          uid: session?.user.uid,
          name: session?.user.name,
          email: session?.user.email,
          image: session?.user.image,
          dateJoined: new Date(), // Change to the appropriate date format
          // You can add other member-related data here
        });
        setIsMember(true); // Set isMember to true after successfully joining
      } else {
        setIsMember(true); // Set isMember to true if the user is already a member
      }
    } catch (error) {
      console.error('Error joining group', error);
    }
  };

  useEffect(() => {
    if (!groupId) return;

    // Fetch group details
    const groupRef = doc(db, 'groups', groupId);
    getDoc(groupRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setGroup(docSnap.data());
          // Check if the current user is a member of the group
          if (session) {
            const membersCollectionRef = collection(db, 'groups', groupId, 'members');
            const memberDocRef = doc(membersCollectionRef, session.user.uid);
            getDoc(memberDocRef).then((memberDocSnap) => {
              if (memberDocSnap.exists()) {
                setIsMember(true);
              }
            });
          }
        } else {
          console.error('Group not found');
          router.push('/'); // Redirect to home or another page
        }
      })
      .catch((error) => {
        console.error('Error fetching group', error);
        router.push('/'); // Redirect to home or another page
      });
  }, [groupId, session]);
console.log('Am i a member', isMember)
  return (
    <div>
      <h1>{group.title}</h1>
      <p>{group.description}</p>
      {isMember ? (
        <button onClick={() => router.push(`/group/${groupId}/chat`)}>View Group</button>
      ) : (
        <>
          {group.private && (
            <input
              type="password"
              placeholder="Enter Group Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          <button onClick={joinGroup}>Join Group</button>
        </>
      )}
      {/* Display group members */}
    </div>
  );
}
