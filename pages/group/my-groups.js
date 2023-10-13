import { useRouter } from 'next/router';
import MyGroups from '../../components/myGroupAndGroupsDiscovery';
import Sidebar from '../../components/Sidebar';
import VerifiedUsersList from '../../components/VerifiedUsersList'

const TheGroup = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <MyGroups />
        <VerifiedUsersList />
        </div>
    </div>
  );
};

export default TheGroup;
