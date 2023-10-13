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
import { db, storage } from '../firebase'; // Import Firebase Storage
import { useSession } from 'next-auth/react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { AiOutlineArrowLeft, AiOutlineClose } from 'react-icons/ai';
import { BsImage } from 'react-icons/bs';
import { toast } from 'react-toastify';
import Moment from 'react-moment'
import { MdVerified } from 'react-icons/md';

export default function GroupManage() {
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
      toast.success('Group Updated Sucessfully');
      setNewGroupBanner(null);
      setNewGroupProfilePicture(null);
    } catch (error) {
      console.error('Error updating group', error);
      toast.error('Error Updating Group')
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

      toast.success('Group deleted Sucessfully')
      router.push('/'); // Redirect to home or another page
    } catch (error) {
      console.error('Error deleting group', error);
      toast.error('Error deleting group');
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


  // delete member ---------------------------------------------
  const deleteMember = async (memberUid) => {
    try {
      // Delete the member from the group
      const memberRef = doc(db, 'groups', groupId, 'members', memberUid);
      await deleteDoc(memberRef);

      // Fetch updated members after deletion
      fetchMembers();

      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member', error);
      toast.error('Error deleting member');
    }
  };

  return (
    <div  className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      <div className='flex sticky top-0 z-10 bg-white items-center justify-between p-4 border-b border-b-gray-300 shadow-md'>
        <div className='flex items-center'>
            <button onClick={() => router.push(`/group/${[groupId]}/chat`)} className='mr-2 text-blue-500 hover:underline'>
            <AiOutlineArrowLeft className='text-2xl text-black'/>
            </button>
            {group.groupProfilePic && (
            <img
                src={group.groupProfilePic}
                alt={'group Profile'}
                className='w-8 h-8 rounded-full object-cover mr-2'
            />
            )}
            <h1 className='text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{group.title}</h1> {group?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline text-xl mt-1 ml-1" />) } {group?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-1 ml-1 text-xl" />) }
        </div>
        
      </div>

      <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Group Title</label>
      <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3"> 
      <input
        type="text"
        placeholder="New Group Title"
        value={newGroupTitle}
        onChange={(e) => setNewGroupTitle(e.target.value)}
        className="bg-transparent w-[90%] outline-none"
      />
      </div>

      <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Group Bio</label>
      <div  className="bg-gray-200 mt-1 flex h-[140px] gap-2 rounded-[20px] py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3">
      <textarea
        placeholder="New Group Description"
        value={newGroupDescription}
        onChange={(e) => setNewGroupDescription(e.target.value)}
        className="bg-transparent w-[90%] outline-none no-scrollbar h-[100px]"
      />
      </div>

      <div>
      <div className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Banner Picture</div>
      <label  htmlFor="file" className="block mb-1 mt-3 mx-3 font-semibold text-[17px]"><BsImage className='cursor-pointer text-yellow-500 text-xl' /></label>
      <input
        id="file"
        type="file"
        accept="image/*"
        onChange={(e) =>
          setNewGroupBanner(e.target.files[0])
        }
        hidden
      />
    {newGroupBanner ? (
    <div className="relative mb-4 mx-3">
        <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setNewGroupBanner(null)}>
        <AiOutlineClose className="text-white h-5" />
        </div>

        <img src={URL.createObjectURL(newGroupBanner)} alt="" style={{ maxWidth: '400px', maxHeight: '200px' }} className="rounded-2xl max-h-80 object-contain" />
    </div>
      ) : (
        group.groupBanner && (
        <img
            src={group.groupBanner}
            alt="Group banner Picture"
            style={{ maxWidth: '400px', maxHeight: '200px' }}
            className="rounded-2xl max-h-80 object-contain mx-3"
        />
      ))}
      </div>

      <div>
      <div className="block mb-1 mt-3 mx-3 font-semibold text-[17px]">Group Profile Picture</div>
      <label  htmlFor="groupbanner" className="block mb-1 mt-3 mx-3 font-semibold text-[17px]"><BsImage className='cursor-pointer text-yellow-500 text-xl' /></label>
      <input
        id="groupbanner"
        type="file"
        accept="image/*"
        onChange={(e) =>
          setNewGroupProfilePicture(e.target.files[0])
        }
        hidden
      />
      {newGroupProfilePicture ? (
            <div className="relative mb-4 mx-3">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setNewGroupProfilePicture(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={URL.createObjectURL(newGroupProfilePicture)} alt="" style={{ maxWidth: '400px', maxHeight: '200px' }} className="rounded-2xl max-h-80 object-contain" />
            </div>
          ) : (
        group.groupProfilePic && (
        <img
          src={group.groupProfilePic}
          alt="Group Profile Picture"
          style={{ maxWidth: '400px', maxHeight: '200px' }}
          className="rounded-2xl max-h-80 object-contain mx-3"
        />
      ))}
      </div>

      <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Group Purpose</label>
      <div  className="bg-gray-200 mt-1 flex h-[140px] gap-2 rounded-[20px] py-2 px-4 text-black items-center text-[15px] w-[90%] mx-3">
      <textarea
        placeholder="New Group Purpose"
        value={newGroupPurpose}
        onChange={(e) => setNewGroupPurpose(e.target.value)}
        className="bg-transparent w-[90%] outline-none no-scrollbar h-[100px]"
      />
      </div>

      <div className="block mb-4 mt-4 mx-3">
        <div className="text-[17px] font-semibold mb-2">Total Messages: {totalMessages}</div>
        <div className="flex items-center cursor-pointer" onClick={toggleMembersDropdown}>
            <p className="mr-1">Total Members: {members.length}</p>
            <span className={`text-lg ${showMembersDropdown ? 'transform rotate-0' : 'transform rotate-180'} transition-transform`}>▼</span>
        </div>
        {showMembersDropdown && (
            <ul className="mt-2 space-y-2 bg-gray-200 shadow-md rounded-[20px]">
            {members.map((member) => (
                <li key={member.uid} className="flex items-center rounded-[20px] justify-between p-2 border-b border-b-gray-300">
                <div className='flex items-center gap-2'>
                 <img
                    src={member.image}
                    alt='member'
                    className='w-9 h-9 rounded-full'
                />
                <span>{member.name}</span>
                
                </div>

                <div className='flex items-center gap-2'>
                <Moment fromNow>{member.dateJoined.toDate()}</Moment>
                {session.user.uid !== member.uid && (
                    <button className="text-white bg-red-500 font-semibold p-2 rounded-[20px] cursor-pointer hover:bg-red-600" onClick={() => deleteMember(member.uid)}>
                    Delete
                    </button>
                )}
                </div>
                </li>
            ))}
            </ul>
        )}
      </div>


     <div className='flex justify-between mx-3 mt-5 mb-[60px]'>
      <button  className=' text-white bg-yellow-500 font-semibold text-center p-3 rounded-[20px] cursor-pointer' onClick={updateGroup}>Update Group</button>
      <button className=' text-white bg-red-500 font-semibold text-center p-3 rounded-[20px] cursor-pointer' onClick={deleteGroup}>Delete Group</button>
     </div>
    </div>
  );
}
