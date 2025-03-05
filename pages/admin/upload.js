import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function UploadPage() {
  const router = useRouter();
  const { modelId } = router.query;
  
  useEffect(() => {
    // Redirect to admin page with upload tab active
    if (modelId) {
      router.replace(`/admin?tab=upload&modelId=${modelId}`);
    } else {
      router.replace('/admin?tab=upload');
    }
  }, [router, modelId]);
  
  return (
    <AdminLayout title="Upload Images">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    </AdminLayout>
  );
} 