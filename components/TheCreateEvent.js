import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const TheCreateEvent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [eventData, setEventData] = useState({
    eventName: '',
    startDate: '',
    endDate: '',
    eventType: '',
    eventLocation: '',
    eventDescription: '',
    coHosts: [],
  });
  const [bannerImage, setBannerImage] = useState(null);

  useEffect(() => {
    const fetchUserVerification = async () => {
      if (session) {
        const userDoc = doc(db, 'users', session.user.uid);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();

        if (userData && userData.isVerified) {
          setIsVerified(true);
        }
      }
    };

    fetchUserVerification();
  }, [session]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setBannerImage(file);
  };

  const handleEventSubmission = async () => {
    try {
      if (!isVerified) {
        toast.error('Verify your account to create an event');
        return;
      }

      let bannerImageUrl = '';
      if (bannerImage) {
        const storageRef = ref(storage, `event-banners/${bannerImage.name}`);
        await uploadBytes(storageRef, bannerImage);
        bannerImageUrl = await getDownloadURL(storageRef);
      }

      const eventsRef = collection(db, 'events');
      const newEventRef = await addDoc(eventsRef, {
        creatorName: session.user.name,
        creatorImage: session.user.image,
        creatorId:  session.user.uid,
        eventName: eventData.eventName,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        eventType: eventData.eventType,
        eventLocation: eventData.eventLocation,
        eventDescription: eventData.eventDescription,
        coHosts: eventData.coHosts,
        banner: bannerImageUrl,
        createdAt: serverTimestamp(),
      });

      const eventId = newEventRef.id;

      await updateDoc(newEventRef, { eventId });

      setEventData({
        eventName: '',
        startDate: '',
        endDate: '',
        eventType: '',
        eventLocation: '',
        eventDescription: '',
        coHosts: [],
      });
      setBannerImage(null);

      toast.success('Event created successfully!');
      router.push(`/events/${eventId}`);
    } catch (error) {
      toast.error('Error creating event. Please try again.');
    }
  };

  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r flex items-center justify-center bg-gray-100 border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 mt-4 text-center">Event Creation</h2>
        {isVerified ? (
          <form>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Event Name"
                value={eventData.eventName}
                onChange={(e) =>
                  setEventData({ ...eventData, eventName: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="datetime-local"
                placeholder="Start Date and Time"
                value={eventData.startDate}
                onChange={(e) =>
                  setEventData({ ...eventData, startDate: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="datetime-local"
                placeholder="End Date and Time"
                value={eventData.endDate}
                onChange={(e) =>
                  setEventData({ ...eventData, endDate: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Event Type"
                value={eventData.eventType}
                onChange={(e) =>
                  setEventData({ ...eventData, eventType: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Event Location"
                value={eventData.eventLocation}
                onChange={(e) =>
                  setEventData({ ...eventData, eventLocation: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Event Description"
                value={eventData.eventDescription}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    eventDescription: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Co-Hosts (comma-separated)"
                value={eventData.coHosts}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    coHosts: e.target.value.split(',').map((host) => host.trim()),
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="bannerImage"
              />
              <label
                htmlFor="bannerImage"
                className="w-full p-2 border rounded cursor-pointer text-blue-500 border-blue-500"
              >
                Upload Banner Image
              </label>
            </div>
            <div className="mb-4">
              <button
                type="button"
                onClick={handleEventSubmission}
                className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-blue-600 cursor-pointer mb-[60px]"
              >
                Submit Event
              </button>
            </div>
          </form>
        ) : (
          <p>Verify your account to create an event</p>
        )}
      </div>
    </div>
  );
};

export default TheCreateEvent;
