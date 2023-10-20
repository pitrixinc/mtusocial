import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  FieldValue,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const AllPosts = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all posts from Firestore
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postsData = [];
        querySnapshot.forEach((doc) => {
          postsData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsData);
      } catch (error) {
        toast.error('Error fetching posts: ' + error.message);
      }
    };

    fetchPosts();
  }, []);

  const togglePostDetails = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deletePost = async (postId) => {
    try {
      const postDocRef = doc(db, 'posts', postId);
      await deleteDoc(postDocRef);
      // Remove the deleted post from the local state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success('Post deleted successfully');
      closeModal(); // Close the modal after successful deletion
    } catch (error) {
      toast.error('Error deleting post: ' + error.message);
    }
  };

  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      <h1>All Posts</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Username</th>
              <th className="border border-gray-300 px-4 py-2">Text</th>
              <th className="border border-gray-300 px-4 py-2">Timestamp</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="border border-gray-300 px-4 py-2">{post.id}</td>
                <td className="border border-gray-300 px-4 py-2">{post.username}</td>
                <td className="border border-gray-300 px-4 py-2">{post.text}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {post.timestamp.toDate().toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 space-x-2 flex items-center gap-3">
                  <button
                    onClick={() => togglePostDetails(post)}
                    className="bg-blue-500 text-white py-1 px-4 rounded-full"
                  >
                    Toggle Details
                  </button>
                  
                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-red-500 text-white py-1 px-4 rounded-full"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 h-screen overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-800 opacity-70 cursor-pointer"
            onClick={closeModal}
          ></div>
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg relative overflow-y-auto no-scrollbar h-[380px] md:h-[450px]">
            <h2 className="text-2xl font-semibold mb-2">Post Details</h2>
            {selectedPost && (
              <div>
                <div className="mb-2">
                  <strong className="font-semibold">Username:</strong>{' '}
                  {selectedPost.username}
                </div>
                <div className="mb-2">
                  <strong className="font-semibold">Text:</strong>{' '}
                  {selectedPost.text}
                </div>
                <div className="mb-2">
                  <strong className="font-semibold">Timestamp:</strong>{' '}
                  {selectedPost.timestamp.toDate().toLocaleString()}
                </div>
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={() => deletePost(selectedPost.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                Delete Post
              </button>
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

export default AllPosts;
