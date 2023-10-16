import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { doc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const TheUsers = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedTag, setUpdatedTag] = useState('');
  const [updatedProfileImage, setUpdatedProfileImage] = useState(null);
  const [updateIsVerified, setUpdateIsVerified] = useState(false);
  const [updateIsQualifiedForBadge, setUpdateIsQualifiedForBadge] = useState(false);
  const [updateIsQualifiedForGoldBadge, setUpdateIsQualifiedForGoldBadge] = useState(false);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userData = [];

        querySnapshot.forEach((doc) => {
          userData.push({ id: doc.id, ...doc.data() });
        });

        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (userId) => {
    const user = users.find((user) => user.id === userId);
    setEditingUserId(userId);
    setUpdatedName(user.name);
    setUpdatedEmail(user.email);
    setUpdatedTag(user.tag);
    setUpdatedProfileImage(user.profileImage);
    setUpdateIsVerified(user.isVerified);
    setUpdateIsQualifiedForBadge(user.isQualifiedForBadge);
    setUpdateIsQualifiedForGoldBadge(user.isQualifiedForGoldBadge);
  };

  const handleUpdateUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        name: updatedName,
        email: updatedEmail,
        tag: updatedTag,
        profileImage: updatedProfileImage,
        isVerified: updateIsVerified || false,
        isQualifiedForBadge: updateIsQualifiedForBadge || false,
        isQualifiedForGoldBadge: updateIsQualifiedForGoldBadge || false,
      });

      setEditingUserId(null);
      toast.success('User details updated successfully');
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error('Failed to update user details');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === process.env.NEXT_PUBLIC_UID_ADMIN) {
      toast.error('You cannot delete the admin user.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);

        // Remove the user from the local state
        setUsers(users.filter((user) => user.id !== userId));

        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div  className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <table className="table-auto text-[1.2rem] relative w-full h-70 block overflow-x-scroll overflow-y-scroll ml-0 mt-10px">
        <thead className="bg-gray-50">
          <tr>
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider  whitespace-nowrap">
              Profile Image
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              signupDate
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              isVerified
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              isQualifiedForBadge
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              isQualifiedForGoldBadge
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">
              id
            </th>
            
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={updatedProfileImage}
                    onChange={(e) => setUpdatedProfileImage(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                    disabled
                  />
                ) : (
                  <div className="text-sm text-gray-900"><img src={user.profileImage} alt='' className='rounded-full' /></div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.name}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.email}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={updatedTag}
                    onChange={(e) => setUpdatedTag(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.tag}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.signupDate}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <select
                  value={updateIsVerified}
                  onChange={(e) => setUpdateIsVerified(e.target.value === 'true')}
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                ) : (
                  <div className="text-sm text-gray-900"> {user.isVerified ? 'Yes' : 'No'}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <select
                  value={updateIsQualifiedForBadge}
                  onChange={(e) => setUpdateIsQualifiedForBadge(e.target.value === 'true')}
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                ) : (
                  <div className="text-sm text-gray-900"> {user.isQualifiedForBadge ? 'Yes' : 'No'}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUserId === user.id ? (
                  <select
                  value={updateIsQualifiedForGoldBadge}
                  onChange={(e) => setUpdateIsQualifiedForGoldBadge(e.target.value === 'true')}
                  className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                ) : (
                  <div className="text-sm text-gray-900"> {user.isQualifiedForGoldBadge ? 'Yes' : 'No'}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.id}</div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingUserId === user.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateUser(user.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1 rounded-lg"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-3 py-1 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                    {user.id !== process.env.NEXT_PUBLIC_UID_ADMIN && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TheUsers;