import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, storage } from '../../../firebase'; // Import Firebase Storage
import { useSession } from 'next-auth/react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export default function ManageGroup() {
  const router = useRouter();
  const { groupId } = router.query;
  const { data: session } = useSession(); // Get the user session
  const [group, setGroup] = useState({});
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupBanner, setNewGroupBanner] = useState(null);
  const [newGroupProfilePicture, setNewGroupProfilePicture] = useState(null);
  const [newGroupPurpose, setNewGroupPurpose] = useState('');
  const [totalMessages, setTotalMessages] = useState(0);
  const [members, setMembers] = useState([]);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  const updateGroup = async () => {
    try {
      const updates = {
        title: newGroupTitle,
        description: newGroupDescription,
        purpose: newGroupPurpose,
      };

      if (newGroupBanner) {
        // Upload and update group banner image
        const bannerRef = ref(
          storage,
          `group_banners/${groupId}`
        );
        await uploadBytes(bannerRef, newGroupBanner);
        const bannerURL = await getDownloadURL(bannerRef);
        updates.groupBanner = bannerURL;
      }

      if (newGroupProfilePicture) {
        // Upload and update group profile picture
        const profilePictureRef = ref(
          storage,
          `group_profile_pics/${groupId}`
        );
        await uploadBytes(profilePictureRef, newGroupProfilePicture);
        const profilePictureURL = await getDownloadURL(
          profilePictureRef
        );
        updates.groupProfilePic = profilePictureURL;
      }

      await updateDoc(doc(db, 'groups', groupId), updates);
    } catch (error) {
      console.error('Error updating group', error);
    }
  };

  const deleteGroup = async () => {
    try {
      // Delete group images from storage
      const bannerRef = ref(
        storage,
        `group_banners/${groupId}`
      );
      const profilePictureRef = ref(
        storage,
        `group_profile_pics/${groupId}`
      );
      await deleteObject(bannerRef);
      await deleteObject(profilePictureRef);

      // Delete the group document in Firestore
      await deleteDoc(doc(db, 'groups', groupId));

      router.push('/'); // Redirect to home or another page
    } catch (error) {
      console.error('Error deleting group', error);
    }
  };

  const fetchMembers = () => {
    const membersRef = collection(db, 'groups', groupId, 'members');
    getDocs(membersRef)
      .then((snapshot) => {
        const membersData = [];
        snapshot.forEach((doc) => {
          membersData.push(doc.data());
        });
        setMembers(membersData);
      })
      .catch((error) => {
        console.error('Error fetching members', error);
      });
  };

  useEffect(() => {
    if (!groupId) return;

    // Fetch group details
    const groupRef = doc(db, 'groups', groupId);
    getDoc(groupRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setGroup(docSnap.data());
          setNewGroupTitle(docSnap.data().title);
          setNewGroupDescription(docSnap.data().description);
          setNewGroupPurpose(docSnap.data().purpose || ''); // Set purpose

          // Check if the current user is the creator
          if (session?.user.uid !== docSnap.data().creatorId) {
            router.push('/'); // Redirect to home if not the creator
          }
        } else {
          console.error('Group not found');
          router.push('/'); // Redirect to home or error page
        }
      })
      .catch((error) => {
        console.error('Error fetching group', error);
        router.push('/'); // Redirect to home or error page
      });

    // Fetch members
    fetchMembers();

    // Fetch total number of messages
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    getDocs(messagesRef)
      .then((snapshot) => {
        setTotalMessages(snapshot.size);
      })
      .catch((error) => {
        console.error('Error fetching messages', error);
      });
  }, [groupId, session]);

  const toggleMembersDropdown = () => {
    setShowMembersDropdown(!showMembersDropdown);
  };

  return (
    <div>
      <h1>Edit Group</h1>
      <input
        type="text"
        placeholder="New Group Title"
        value={newGroupTitle}
        onChange={(e) => setNewGroupTitle(e.target.value)}
      />
      <textarea
        placeholder="New Group Description"
        value={newGroupDescription}
        onChange={(e) => setNewGroupDescription(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setNewGroupBanner(e.target.files[0])
        }
      />
      {group.groupBanner && (
        <img
          src={group.groupBanner}
          alt="Group Banner"
          style={{ maxWidth: '200px', maxHeight: '200px' }}
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setNewGroupProfilePicture(e.target.files[0])
        }
      />
      {group.groupProfilePic && (
        <img
          src={group.groupProfilePic}
          alt="Group Profile Picture"
          style={{ maxWidth: '200px', maxHeight: '200px' }}
        />
      )}
      <textarea
        placeholder="New Group Purpose"
        value={newGroupPurpose}
        onChange={(e) => setNewGroupPurpose(e.target.value)}
      />
      <button onClick={updateGroup}>Update Group</button>
      <button onClick={deleteGroup}>Delete Group</button>

      <div>
        <p>Total Messages: {totalMessages}</p>
        <p
          onClick={toggleMembersDropdown}
          style={{ cursor: 'pointer' }}
        >
          Total Members: {members.length}{' '}
          {showMembersDropdown ? '▲' : '▼'}
        </p>
        {showMembersDropdown && (
          <ul>
            {members.map((member) => (
              <li key={member.uid}>{member.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
