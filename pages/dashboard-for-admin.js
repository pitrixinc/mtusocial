import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AdminDashBoard from '../components/Admin/AdminDashBoard';
import VerifiedUsersList from '../components/VerifiedUsersList';
import { useRouter } from 'next/router';
import {toast} from 'react-toastify';
import AdminSidebar from '../components/Admin/AdminSidebar';


const DashboardForAdmin = () => {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPassword, setVerificationPassword] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [adminData, setAdminData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if the current user is the qualified admin (based on UID)
    if (session && session.user.uid === process.env.NEXT_PUBLIC_UID_ADMIN) {
      setIsAdmin(true);

      // Check if it's the first time the admin is visiting
      const adminDocRef = doc(db, 'admin', session.user.uid);
      getDoc(adminDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            // Admin data already exists
            setAdminData(docSnapshot.data());
          } else {
            // It's the first time; create an admin record
            setDoc(adminDocRef, {
              uid: session.user.uid,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              tag: session.user.tag,
              password: session.user.uid,
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching admin data:', error);
        });
    } else {
      // Clear admin data and set isAdmin to false if not authorized
      setIsAdmin(false);
      setAdminData(null);
      setIsAdminLoggedIn(false); // Ensure isAdminLoggedIn is also set to false
    }
  }, [session]);

  const handleVerification = () => {
    // Verify the entered email and password
    const adminDocRef = doc(db, 'admin', session.user.uid);

    if (adminData && adminData.email === verificationEmail && adminData.password === verificationPassword) {
      // Verification successful, allow access to admin panel content
      setVerificationError('');
      setIsAdminLoggedIn(true);
      toast.success("Admin Successfully Logged In")
    } else {
      setVerificationError('Incorrect email or password.');
      toast.error("Incorrect Password Or Email or Something went wrong")
    }
  };

  if (session && session.user.uid !== process.env.NEXT_PUBLIC_UID_ADMIN) {
    // If the user is not the admin, navigate them to the homepage
    toast.error("Access Denied!")
    router.push('/');
    return null;
  }

  return (
    <div className="admin-panel-container">
      {isAdminLoggedIn ? (
        // Display the specified content when the admin is logged in
        <div className='relative max-w-[1400px] mx-auto'>
          <AdminSidebar />
          <div className='flex gap-6'>
            <AdminDashBoard />
            <VerifiedUsersList />
          </div>
        </div>
      ) : (
        // Ask for verification
        <div className="flex justify-center items-center h-screen bg-gradient-to-r from-yellow-500 to-black">
  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full space-y-4 mx-2">
    <h2 className="text-3xl font-semibold text-center text-gray-800">Admin Verification</h2>
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-gray-700">Email</label>
        <input
          type="text"
          id="email"
          placeholder="Enter your email"
          value={verificationEmail}
          onChange={(e) => setVerificationEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={verificationPassword}
          onChange={(e) => setVerificationPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>
      <button
        onClick={handleVerification}
        className="w-full bg-gradient-to-r from-yellow-500 to-black hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
      >
        Verify
      </button>
      {verificationError && (
        <p className="text-red-500 text-sm text-center">{verificationError}</p>
      )}
    </div>
  </div>
</div>

      )}
    </div>
  );
};

export default DashboardForAdmin;
