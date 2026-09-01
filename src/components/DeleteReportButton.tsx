'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface DeleteReportButtonProps {
  id: string;
  domain: string;
}

export default function DeleteReportButton({ id, domain }: DeleteReportButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/report/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsModalOpen(false);
        router.push('/reports');
      } else {
        alert('Failed to delete report. Please try again.');
      }
    } catch (e) {
      alert('An error occurred while deleting the report.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all shadow-sm group"
        title="Delete this report"
      >
        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span>Delete</span>
      </button>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        targetDomain={domain}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
