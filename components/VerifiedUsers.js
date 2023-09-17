// Import the necessary dependencies
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {MdVerified} from 'react-icons/md';


// Define the VerifiedUsers component
export default function VerifiedUsers() {
  const [usersWithBadge, setUsersWithBadge] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('isQualifiedForBadge', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setLoading(false);
          return;
        }

        // Get all verified users
        const allVerifiedUsers = querySnapshot.docs.map((doc) => doc.data());

        // Randomly shuffle the array (Fisher-Yates shuffle)
        const shuffledVerifiedUsers = [...allVerifiedUsers];
        for (let i = shuffledVerifiedUsers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledVerifiedUsers[i], shuffledVerifiedUsers[j]] = [
            shuffledVerifiedUsers[j],
            shuffledVerifiedUsers[i],
          ];
        }

        // Get up to 6 random verified users
        const limitedVerifiedUsers = shuffledVerifiedUsers.slice(0, 6);

        setUsersWithBadge(limitedVerifiedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching verified users', error);
        setLoading(false);
      }
    };

    fetchVerifiedUsers();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : usersWithBadge.length > 0 ? (
        <div className="w-[350px]">
          {usersWithBadge.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow border-b border-gray-[110px]">
            <div className="flex items-center">
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className='ml-2'>
                <span className="font-semibold">{user.name} <MdVerified className="text-yellow-500 inline" /></span>
                <p className="mt-1 text-gray-600">@{user.tag}</p>
              </div>
            </div>
          </div>
          
          ))}
        </div>
      ) : (
        <p>No Verified User</p>
      )}
    </div>
  );
}
