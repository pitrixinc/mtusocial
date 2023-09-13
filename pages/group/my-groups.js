import { useRouter } from 'next/router';
import MyGroups from '../../components/myGroupAndGroupsDiscovery';
import Sidebar from '../../components/Sidebar';
import ProfileData from '../../components/ProfileData';

const ConversationPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <MyGroups />
        <ProfileData />
        </div>
    </div>
  );
};

export default ConversationPage;
