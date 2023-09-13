import { useState } from 'react';
import { useRouter } from 'next/router';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useSession } from 'next-auth/react';

export default function CreateGroup() {
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [groupBannerFile, setGroupBannerFile] = useState(null); // For group banner file
  const [groupProfilePicFile, setGroupProfilePicFile] = useState(null); // For group profile picture file
  const [groupPurpose, setGroupPurpose] = useState(''); // For the purpose of creating the group
  const [isVerified, setIsVerified] = useState(false); // Default isVerified value
  const router = useRouter();
  const { data: session } = useSession();

  const createGroup = async () => {
    try {
      // Create a new group document
      const groupDocRef = await addDoc(collection(db, 'groups'), {
        title: groupTitle,
        description: groupDescription,
        private: isPrivate,
        password: isPrivate ? password : '',
        creatorId: session.user.uid,
        createdAt: serverTimestamp(),
        groupPurpose: groupPurpose,
        isVerified: isVerified,
      });

      const groupId = groupDocRef.id;

     // Update the group document with the groupId
    await updateDoc(doc(db, 'groups', groupId), {
      id: groupId,
    });

      // Upload group banner and profile picture files (if selected)
      if (groupBannerFile) {
        // Upload group banner file to storage and get the URL
        // Replace 'your-storage-ref' with your actual storage reference
        const bannerStorageRef = ref(storage, `group_banners/${groupId}`);
        await uploadBytes(bannerStorageRef, groupBannerFile);
        const bannerDownloadURL = await getDownloadURL(bannerStorageRef);

        // Update the group document with the banner URL
        await updateDoc(doc(db, 'groups', groupId), {
          groupBanner: bannerDownloadURL,
        });
      }

      if (groupProfilePicFile) {
        // Upload group profile picture file to storage and get the URL
        // Replace 'your-storage-ref' with your actual storage reference
        const profilePicStorageRef = ref(storage, `group_profile_pics/${groupId}`);
        await uploadBytes(profilePicStorageRef, groupProfilePicFile);
        const profilePicDownloadURL = await getDownloadURL(profilePicStorageRef);

        // Update the group document with the profile picture URL
        await updateDoc(doc(db, 'groups', groupId), {
          groupProfilePic: profilePicDownloadURL,
        });
      }

      // Redirect to the group page
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error('Error creating group', error);
    }
  };

  return (
    <div className="items-center justify-center text-center">
      <h1 className="text-xl font-bold">Create a New Group</h1>
      <label>Group Title</label> <br />
      <input
        type="text"
        placeholder="Group Title"
        value={groupTitle}
        onChange={(e) => setGroupTitle(e.target.value)}
      /> <br />
      <label>Group Description</label> <br />
      <textarea
        placeholder="Group Description"
        value={groupDescription}
        onChange={(e) => setGroupDescription(e.target.value)}
      /> <br />
      <label>Group Banner</label> <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setGroupBannerFile(e.target.files[0])}
      /> <br />
      <label>Group Profile Picture</label> <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setGroupProfilePicFile(e.target.files[0])}
      /> <br />
      <label>Group Purpose</label> <br />
      <textarea
        placeholder="Group Purpose"
        value={groupPurpose}
        onChange={(e) => setGroupPurpose(e.target.value)}
      /> <br />
      <label>
        Private Group:
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
        />
      </label> <br />
      {isPrivate && (
        <input
          type="password"
          placeholder="Enter Group Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )} <br />
      <button onClick={createGroup} className="bg-yellow-500 text-white font-semibold rounded-lg p-4">
        Create Group
      </button>
    </div>
  );
}
