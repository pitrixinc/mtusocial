import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react'
import { BsEmojiSmile, BsImage, BsTwitter } from "react-icons/bs"
import Image from 'next/image'
import { FcGoogle } from "react-icons/fc"
import Logo from "../assets/images/mtu2.png";
import Typewriter from "typewriter-effect";
import { useSession } from 'next-auth/react';
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { toast } from 'react-toastify';
import { AiOutlineClose } from 'react-icons/ai';

const Verify = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Student'); // Default role is Student
  const [verifiedBadge, setVerifiedBadge] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false); // State to track application submission status


  // Fetch user data when the session is available
  useEffect(() => {
    if (session?.user) {
      // Assuming you have a "users" collection
      const userDocRef = doc(db, 'users', session.user.uid);

      // Fetch the user's data from Firestore
      const fetchData = async () => {
        try {
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userDocData = userDocSnapshot.data();
            setUserData(userDocData); // Set user data in state
          }
        } catch (error) {
          toast.error('Error fetching user data');
        }
      };

      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (userData) {
      // Check if the user has already submitted an application
      const checkApplication = async () => {
        const applyVerifyQuery = query(
          collection(db, 'applyVerify'),
          where('id', '==', userData.id)
        );

        try {
          const querySnapshot = await getDocs(applyVerifyQuery);
          if (!querySnapshot.empty) {
            // User has already submitted an application
            setApplicationSubmitted(true);
          }
        } catch (error) {
          console.error('Error checking application:', error);
        }
      };

      checkApplication();
    }
  }, [userData]);


   // Define the fields and labels for each role
   const roleFields = {
    Student: [
      { label: 'Name', key: 'name' },
      { label: 'Student ID or Application Number', key: 'studentId' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Program or Major', key: 'major' },
      { label: 'Enrollment Status (Full-time, Part-time)', key: 'enrollmentStatus' },
      { label: 'Address', key: 'address' },
      { label: 'Emergency Contact Information', key: 'emergencyContact' },
    ],
    'Faculty Members / Lecturers / Professors': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Academic Department', key: 'academicDepartment' },
      { label: 'Faculty Rank or Title', key: 'facultyRank' },
      { label: 'Research Interests', key: 'researchInterests' },
      { label: 'Office Location', key: 'officeLocation' },
    ],
    'Administrative Staff': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Department', key: 'department' },
      { label: 'Job Title', key: 'jobTitle' },
      { label: 'Supervisor\'s Name', key: 'supervisorName' },
    ],
    'Administrative Leadership': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Title or Position', key: 'titleOrPosition' },
      { label: 'Department or Area of Responsibility', key: 'departmentOrArea' },
    ],
    'Research Scholars / Postdoctoral Researchers': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Research Supervisor (if applicable)', key: 'researchSupervisor' },
      { label: 'Research Focus or Project', key: 'researchFocus' },
    ],
    'Support Staff': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Department or Area of Work', key: 'departmentOrArea' },
      { label: 'Job Title', key: 'jobTitle' },
    ],
    'Librarians': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Library Department', key: 'libraryDepartment' },
      { label: 'Areas of Library Expertise', key: 'libraryExpertise' },
    ],
    'Counselors / Advisors': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Counseling Area (Academic, Career, Personal)', key: 'counselingArea' },
      { label: 'Office Location', key: 'officeLocation' },
    ],
    'Tutors / Teaching Assistants (TAs)': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Course or Courses Supported', key: 'coursesSupported' },
      { label: 'Faculty Supervisor (if applicable)', key: 'facultySupervisor' },
    ],
    Alumni: [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Graduation Year', key: 'graduationYear' },
      { label: 'Major or Degree Earned', key: 'degreeEarned' },
      { label: 'Alumni Association Affiliation', key: 'alumniAssociation' },
    ],
    'Visiting Scholars': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Affiliated University or Institution', key: 'affiliatedInstitution' },
      { label: 'Purpose of Visit', key: 'purposeOfVisit' },
    ],
    'Guest Lecturers': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Affiliated Organization or Institution', key: 'affiliatedOrganization' },
      { label: 'Lecture Topic', key: 'lectureTopic' },
    ],
    'Adjunct Faculty': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Department', key: 'department' },
      { label: 'Course Taught', key: 'courseTaught' },
    ],
    'Researchers and Lab Technicians': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Research Project or Lab Affiliation', key: 'labAffiliation' },
    ],
    'Security Personnel': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Security Department', key: 'securityDepartment' },
    ],
    'Health Services Staff': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Role (e.g., Nurse, Counselor, Doctor)', key: 'healthRole' },
      { label: 'Clinic or Health Center', key: 'healthCenter' },
    ],
    'Financial Aid Officers': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Financial Aid Office', key: 'aidOffice' },
    ],
    'Community and Public Relations Staff': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Public Relations Department', key: 'prDepartment' },
    ],
    'Athletics Department': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Sport or Role (e.g., Coach, Athlete)', key: 'athleticsRole' },
    ],
    'IT and Technology Support': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'IT Department', key: 'itDepartment' },
    ],
    'Dining Services Staff': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Dining Services Department', key: 'diningDepartment' },
    ],
    'Housing and Residence Life Staff': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Residence Hall or Housing Office', key: 'residenceOffice' },
    ],
    'Environmental and Sustainability Officers': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Sustainability Department', key: 'sustainabilityDepartment' },
    ],
    'Legal Counsel': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Legal Department', key: 'legalDepartment' },
    ],
    'Board of Trustees': [
      { label: 'Name', key: 'name' },
      { label: 'Contact Information (Email, Phone)', key: 'contactInfo' },
      { label: 'Affiliation or Position on the Board', key: 'boardAffiliation' },
    ],    
    // Define fields for other roles here
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const storageRef = ref(
          storage,
          `user_images/${session.user.uid}/${file.name}`
        );
        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        // Update the imageURL state with the URL of the uploaded image
        setImageFile(downloadURL);
      } catch (error) {
        toast.error('Error uploading image:', error);
      }
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a data object based on user input and selected role
    const formData = {};
    roleFields[selectedRole].forEach((field) => {
      formData[field.key] = e.target[field.key].value;
    });

    formData['verifiedBadge'] = verifiedBadge;

    // Use the imageURL state variable to store the image URL
    formData['imageUpload'] = imageFile;

    // Create or access the "applyVerify" collection
    const applyVerifyCollectionRef = collection(db, 'applyVerify');

    try {
      // Add the form data to the "applyVerify" collection
      const docRef = await addDoc(applyVerifyCollectionRef, {
        ...formData,
        id: userData.id,
        username: userData.name,
        userImg: userData.profileImage,
        tag: userData.tag,
        role: selectedRole,
        timestamp: serverTimestamp(),
      });

      // Log the document ID for reference
      toast.success('Application submitted successfully');
    } catch (error) {
      toast.error('Error adding document:', error);
    }
  };

  

  return (
    <div className='grid grid-rows-2 md:grid-cols-2 lg:grid-cols-2 h-screen'>
      {/* ... (your existing UI code) ... */}
      <div className='bg-gradient-to-r from-yellow-500 to-black h-screen hidden md:grid lg:grid place-items-center '>
          <div className='hidden md:block lg:block'>
            <Image className='rounded-[1px]' src={Logo} height="220px" width="500px" />
          </div>
    </div>

      <div className='grid place-items-center h-screen overflow-y-scroll no-scrollbar mb-5'>
      <h1 className="font-bold text-2xl md:text-5xl lg:text-5xl p-5 mt-5">
         <span className="bg-gradient-to-r text-white from-yellow-500 to-black p-5 rounded-lg">Verify Your Identity</span>
      </h1>
      <h1 className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black p-5 text-center">
        <Typewriter 
           options={{
              strings: ['MTU Social: Where Huskies unite, passions ignite, and futures intertwine.','Connect with fellow Huskies; ignite your MTU journey today!','Unlock MTU`s vibrant community; share, inspire, and grow together.','Welcome to MTU Social: Where dreams meet and friendships flourish.','Step into MTU`s digital quad; discover, learn, and connect anew.','Join MTU`s digital campus; spark conversations, forge lifelong friendships.','MTU`s hub for connection: Explore, engage, and empower your aspirations.','Welcome, Huskies! Fuel your ambitions through shared experiences here.','Your gateway to MTU`s dynamic community: Connect, inspire, and excel.','Elevate your MTU experience: Unite, innovate, and thrive together.','Dear Husky, sign up to connect to the world of Tech'],
              autoStart: true,
              loop: true,
           }}
           />
      </h1>

      {applicationSubmitted ? (
          // Display a message if the application has already been submitted
          <p className="text-md md:text-2xl lg:text-2xl font-semibold mx-3 p-5 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">
            Your Verification Application Has Been Submitted, 
            We Will Assess Your Info And Brief You On Your Verification Status Shortly.
          </p>
        ) : (<>
       
        <div className="mt-4 w-[80%]">
          <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Type of Account:</label>
          <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
            <select
              className="bg-transparent w-[100%] outline-none font-semibold cursor-pointer"
              placeholder='Select Role'
              onChange={(e) => setSelectedRole(e.target.value)}
              value={selectedRole}
            >
              {Object.keys(roleFields).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="w-[80%]">
          {roleFields[selectedRole].map((field) => (
            <div key={field.key} className="mt-4">
              <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">
                {field.label}:
              </label>
              <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                <input
                  type="text"
                  className="bg-transparent w-[100%] outline-none font-semibold"
                  placeholder={`Enter ${field.label}`}
                  name={field.key}
                />
              </div>
            </div>
          ))}
          <div className="mt-4 w-[100%]">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">
              Verified Badge:
            </label>
            <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
              <select
                className="bg-transparent w-[100%] outline-none font-semibold"
                onChange={(e) => setVerifiedBadge(e.target.value === 'true')}
                value={verifiedBadge.toString()}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="mt-4 w-[80%]">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">
              Image Upload:
            </label>
            <label  htmlFor="file" className="block mb-1 mt-3 mx-3 font-semibold text-[17px]"><BsImage className='cursor-pointer text-yellow-500 text-xl' /></label>
            <input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
          {imageFile && (
            <div className="relative mb-4 mx-3">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setImageFile(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={imageFile} alt="" className="rounded-2xl max-h-80 object-contain" />
            </div>
          )}
            </div>
            
          <div className='flex justify-between'>
            <p></p>
          <button
            type="submit"
            className="bg-yellow-500 text-white mt-4 py-2 px-4 rounded-full mb-[60px] hover:bg-yellow-600 font-semibold cursor-pointer"
          >
            Submit
          </button>
          </div>
        </form>
        </>)}   
        </div>
         </div>
  )
}

export default Verify