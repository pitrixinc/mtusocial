import { useRouter } from 'next/router';
import Admin from '../../components/Admin/Admin';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import TheUsers from '../../components/Admin/TheUsers';
import VerificationRequest from '../../components/Admin/VerificationRequest';
import MyGroups from '../../components/myGroupAndGroupsDiscovery';
import Sidebar from '../../components/Sidebar';
import VerifiedUsersList from '../../components/VerifiedUsersList'

const RequestVerification = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <AdminSidebar />
        <div className='flex gap-6'>
        <VerificationRequest />
        <VerifiedUsersList />
        </div>
    </div>
  );
};

export default RequestVerification;
