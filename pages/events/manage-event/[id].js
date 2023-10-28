import { useRouter } from 'next/router';
import TheManageEvent from '../../../components/TheManageEvent';
import Sidebar from '../../../components/Sidebar';
import VerifiedUsersList from '../../../components/VerifiedUsersList'

const ManageEvent = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <TheManageEvent />
        <VerifiedUsersList />
        </div>
    </div>
  );
};

export default ManageEvent;
