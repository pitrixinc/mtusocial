import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const Admin = () => {
  const { data: session } = useSession();
  const [adminData, setAdminData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedTag, setUpdatedTag] = useState('');
  const [updatedPassword, setUpdatedPassword] = useState('');

  useEffect(() => {
    // Fetch admin data when the component mounts
    if (session) {
      const adminDocRef = doc(db, 'admin', session.user.uid);
      getDoc(adminDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            setAdminData(docSnapshot.data());
            setUpdatedName(docSnapshot.data().name);
            setUpdatedEmail(docSnapshot.data().email);
            setUpdatedTag(docSnapshot.data().tag);
            setUpdatedPassword(docSnapshot.data().password);
          }
        })
        .catch((error) => {
          console.error('Error fetching admin data:', error);
        });
    }
  }, [session]);

  const handleUpdateAdminDetails = async () => {
    try {
      const adminDocRef = doc(db, 'admin', session.user.uid);
      await updateDoc(adminDocRef, {
        name: updatedName,
        email: updatedEmail,
        tag: updatedTag,
        password: updatedPassword,
      });

      setEditing(false);
      toast.success('Admin details updated successfully');
    } catch (error) {
      console.error('Error updating admin details:', error);
      toast.error('Failed to update admin details');
    }
  };

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      <h2 className="text-2xl font-semibold mb-4">Admin Details</h2>
      {adminData ? (
        <div>
          {editing ? (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700">Email</label>
                <input
                  type="text"
                  id="email"
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="tag" className="block text-gray-700">Tag</label>
                <input
                  type="text"
                  id="tag"
                  value={updatedTag}
                  onChange={(e) => setUpdatedTag(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={updatedPassword}
                  onChange={(e) => setUpdatedPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <button
                onClick={handleUpdateAdminDetails}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Update
              </button>
            </div>
          ) : (
            <div>
              <table className="table-auto w-full">
                <tbody>
                  <tr>
                    <td className="font-semibold">Name</td>
                    <td>{adminData.name}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Email</td>
                    <td>{adminData.email}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Tag</td>
                    <td>{adminData.tag}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Password</td>
                    <td>{adminData.password}</td>
                  </tr>
                </tbody>
              </table>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading admin details...</p>
      )}
    </div>
  );
};

export default Admin;
