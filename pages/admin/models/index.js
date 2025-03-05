import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';

export default function ModelsIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to admin page with models tab active
    router.replace('/admin?tab=models');
  }, [router]);
  
  return (
    <AdminLayout title="models">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    </AdminLayout>
  );
} 