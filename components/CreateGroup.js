import { useState } from 'react';
import { useRouter } from 'next/router';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useSession } from 'next-auth/react';
import { AiOutlineArrowLeft, AiOutlineClose, AiOutlineVideoCameraAdd } from 'react-icons/ai';
import { BsImage } from 'react-icons/bs';
import { toast } from 'react-toastify';

export default function CreateGroup() {
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [groupBannerFile, setGroupBannerFile] = useState(null); // For group banner file
  const [groupProfilePicFile, setGroupProfilePicFile] = useState(null); // For group profile picture file
  const [groupPurpose, setGroupPurpose] = useState(''); // For the purpose of creating the group
  const [isVerified, setIsVerified] = useState(false); // Default isVerified value
  const [isQualifiedForBadge, setIsQQualifiedForBadge] = useState(false);
  const [isQualifiedForGoldBadge, setIsQualifiedForGoldBadge] = useState(false);
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
        isQualifiedForBadge: isQualifiedForBadge,
        isQualifiedForGoldBadge: isQualifiedForGoldBadge,
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
      toast.success('Your group has been created')
      router.push(`/group/${groupId}`);
    } catch (error) {
      toast.error('Error creating group');
      console.error('Error creating group', error);
    }
  };

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      <div className='sticky flex items-center top-0 z-10 bg-white font-medium text-[20px] px-4 py-2 shadow-md border-b border-b-gray-100'>
        <button onClick={() => router.push(`/group/my-groups`)} className='mr-2 text-blue-500 hover:underline sticky'>
            <AiOutlineArrowLeft className='text-2xl text-black'/>
          </button>
         <h1 className="text-xl font-semibold text-gray-800">Create Group</h1>
      </div>

      <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Group Title</label>
      <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3"> 
      <input
        type="text"
        placeholder="Group Title"
        value={groupTitle}
        onChange={(e) => setGroupTitle(e.target.value)}
        className="bg-transparent w-[90%] outline-none"
      />
     </div>

     <label className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Description</label>
     <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3"> 
      <textarea
        placeholder="Group Description"
        value={groupDescription}
        onChange={(e) => setGroupDescription(e.target.value)}
        className="bg-transparent w-[90%] outline-none"
      /> 
      </div>

      <div>
      <div className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Banner Picture</div>
      <label  htmlFor="file" className="block mb-1 mt-3 mx-3 font-semibold text-[17px]"><BsImage className='cursor-pointer text-yellow-500 text-xl' /></label>
      <input
        id="file"
        type="file"
        accept="image/*"
        onChange={(e) => setGroupBannerFile(e.target.files[0])}
        hidden
      /> 
      {groupBannerFile && (
            <div className="relative mb-4 mx-3">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setGroupBannerFile(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={URL.createObjectURL(groupBannerFile)} alt="" className="rounded-2xl max-h-80 object-contain" />
            </div>
          )}
      </div>

      <div>
      <div className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Profile Picture</div>
      <label  htmlFor="groupbanner" className="block mb-1 mt-3 mx-3 font-semibold text-[17px]"><BsImage className='cursor-pointer text-yellow-500 text-xl' /></label>
      <input
        id="groupbanner"
        type="file"
        accept="image/*"
        onChange={(e) => setGroupProfilePicFile(e.target.files[0])}
        hidden
      />
      {groupProfilePicFile && (
            <div className="relative mb-4 mx-3">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setGroupProfilePicFile(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={URL.createObjectURL(groupProfilePicFile)} alt="" className="rounded-2xl max-h-80 object-contain" />
            </div>
          )}
      </div>

      <label className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Purpose</label>
      <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3">
      <textarea
        placeholder="Group Purpose"
        value={groupPurpose}
        onChange={(e) => setGroupPurpose(e.target.value)}
        className="bg-transparent w-[90%] outline-none"
      />
      </div>

      <label className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">
        Private Group:
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
        />
      </label> 
      {isPrivate && (
        <>
        <label className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Password</label>
        <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3">
        <input
          type="password"
          placeholder="Enter Group Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-transparent w-[90%] outline-none"
        />
        </div>
        </>
      )} 

      <div className='flex justify-end mx-3 mt-3'>
        <button onClick={createGroup} className="bg-yellow-500 text-white font-semibold rounded-[20px] p-3 mb-[60px]">
            Create Group
        </button>
      </div>
    </div>
  );
}
