import { useRouter } from 'next/router';
import Admin from '../../components/Admin/Admin';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import MyGroups from '../../components/myGroupAndGroupsDiscovery';
import Sidebar from '../../components/Sidebar';
import VerifiedUsersList from '../../components/VerifiedUsersList'
import TheGroups from '../../components/Admin/TheGroups';

const AllPolls = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <AdminSidebar />
        <div className='flex gap-6'>
        <TheGroups />
        <VerifiedUsersList />
        </div>
    </div>
  );
};

export default AllPolls;
