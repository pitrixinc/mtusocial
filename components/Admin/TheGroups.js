import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { toast } from 'react-toastify';

const AllGroups = () => {
  const { data: session } = useSession();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch all groups from Firestore
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'groups'));
        const groupList = [];
        querySnapshot.forEach((doc) => {
          groupList.push({ id: doc.id, ...doc.data() });
        });
        setGroups(groupList);
      } catch (error) {
        toast.error('Error fetching groups: ' + error.message);
      }
    };

    fetchGroups();
  }, []);

  const updateGroup = async (groupId, updatedFields) => {
    try {
      const groupDocRef = doc(db, 'groups', groupId);
      await updateDoc(groupDocRef, updatedFields);
      toast.success('Group updated successfully');

      // If group images are updated, reload the groups
      if (updatedFields.groupProfilePic || updatedFields.groupBanner) {
        const updatedGroups = groups.map((group) =>
          group.id === groupId ? { ...group, ...updatedFields } : group
        );
        setGroups(updatedGroups);
      }
    } catch (error) {
      toast.error('Error updating group: ' + error.message);
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      const groupDocRef = doc(db, 'groups', groupId);
      await deleteDoc(groupDocRef);

      // Remove the deleted group from the local state
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));

      toast.success('Group deleted successfully');
    } catch (error) {
      toast.error('Error deleting group: ' + error.message);
    }
  };

  const openModal = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
    setEditMode(false);
  };

  const openEditMode = () => {
    setEditMode(true);
  };

  const closeModal = () => {
    setSelectedGroup(null);
    setIsModalOpen(false);
    setEditMode(false);
  };

  const handleImageChange = async (file, field) => {
    try {
      const storageRef = storage.ref();
      const imageRef = storageRef.child(`group_${field}_${selectedGroup.id}`);
      await imageRef.put(file);
      const imageUrl = await imageRef.getDownloadURL();

      // Update the group with the new image URL
      updateGroup(selectedGroup.id, { [field]: imageUrl });
    } catch (error) {
      toast.error('Error updating image: ' + error.message);
    }
  };

  const handleInputChange = (e, field) => {
    setSelectedGroup((prevGroup) => ({
      ...prevGroup,
      [field]: e.target.value,
    }));
  };

  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      <h1>All Groups</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th>ID</th>
              <th>Profile Image</th>
              <th>Banner</th>
              <th>Title</th>
              <th>Description</th>
              <th>Creator ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>
                  <img src={group.groupProfilePic} alt="" />
                </td>
                <td>
                  <img src={group.groupBanner} alt="" />
                </td>
                <td>{group.title}</td>
                <td>{group.description.slice(0, 50)}...</td>
                <td>{group.creatorId}</td>
                <td>
                  <button onClick={() => deleteGroup(group.id)}>Delete</button>
                  <button onClick={() => openModal(group)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom modal for displaying/editing group details */}
      {/* Custom modal for displaying/editing group details */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 h-screen overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-800 opacity-70 cursor-pointer"
            onClick={closeModal}
          ></div>
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg relative overflow-y-auto no-scrollbar h-[380px] md:h-[450px]">
            <h2 className="text-2xl font-semibold mb-2">
              {editMode ? 'Edit Group' : 'Group Details'}
            </h2>
            {selectedGroup && (
              <div>
                <p>ID: {selectedGroup.id}</p>
                <p>Title: {selectedGroup.title}</p>
                <p>Description: {selectedGroup.description}</p>
                <p>Creator ID: {selectedGroup.creatorId}</p>
                <p>Number of Members: {selectedGroup.members?.length || 0}</p>
                <p>Members:</p>
                <ul>
                  {selectedGroup.members?.map((member) => (
                    <li key={member.id}>{member.name}</li>
                  ))}
                </ul>
                {editMode && (
                  <div>
                    <label>
                      Title:{' '}
                      <input
                        type="text"
                        value={selectedGroup.title}
                        onChange={(e) => handleInputChange(e, 'title')}
                      />
                    </label>
                    <label>
                      Description:{' '}
                      <textarea
                        value={selectedGroup.description}
                        onChange={(e) => handleInputChange(e, 'description')}
                      />
                    </label>
                    {selectedGroup.isPrivate && (
                      <label>
                        Password:{' '}
                        <input
                          type="text"
                          value={selectedGroup.password}
                          onChange={(e) => handleInputChange(e, 'password')}
                        />
                      </label>
                    )}
                    <label>
                      Group Purpose:{' '}
                      <input
                        type="text"
                        value={selectedGroup.groupPurpose}
                        onChange={(e) => handleInputChange(e, 'groupPurpose')}
                      />
                    </label>
                    <label>
                      Is Verified:{' '}
                      <input
                        type="checkbox"
                        checked={selectedGroup.isVerified}
                        onChange={(e) => handleInputChange(e, 'isVerified')}
                      />
                    </label>
                    <label>
                      Is Qualified for Badge:{' '}
                      <input
                        type="checkbox"
                        checked={selectedGroup.isQualifiedForBadge}
                        onChange={(e) => handleInputChange(e, 'isQualifiedForBadge')}
                      />
                    </label>
                    <label>
                      Is Qualified for Gold Badge:{' '}
                      <input
                        type="checkbox"
                        checked={selectedGroup.isQualifiedForGoldBadge}
                        onChange={(e) => handleInputChange(e, 'isQualifiedForGoldBadge')}
                      />
                    </label>
                    <label>
                      Group Profile Pic:{' '}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files[0], 'groupProfilePic')}
                      />
                    </label>
                    <label>
                      Group Banner:{' '}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files[0], 'groupBanner')}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 text-right">
              {editMode ? (
                <button
                  onClick={() =>
                    updateGroup(selectedGroup.id, {
                      title: selectedGroup.title,
                      description: selectedGroup.description,
                      password: selectedGroup.password,
                      groupPurpose: selectedGroup.groupPurpose,
                      isVerified: selectedGroup.isVerified,
                      isQualifiedForBadge: selectedGroup.isQualifiedForBadge,
                      isQualifiedForGoldBadge: selectedGroup.isQualifiedForGoldBadge,
                      groupProfilePic: selectedGroup.groupProfilePic,
                      groupBanner: selectedGroup.groupBanner,
                    })
                  }
                  className="bg-green-500 text-white py-1 px-4 rounded-full"
                >
                  Update
                </button>
              ) : (
                <button onClick={openEditMode} className="bg-blue-500 text-white py-1 px-4 rounded-full">
                  Edit
                </button>
              )}
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 hover:text-gray-800 ml-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllGroups;
