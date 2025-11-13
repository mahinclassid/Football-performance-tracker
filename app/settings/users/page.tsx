'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PlusIcon, PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { UserForm } from '@/components/forms/UserForm';
import {
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  type ActionResult,
} from '@/app/actions/users';
import { useToast } from '@/components/ui/Toast';
import { Toast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const { showToast, toast, setToast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: users = [], mutate } = useSWR<User[]>('/api/users', fetcher, {
    revalidateOnFocus: true,
  });

  // Redirect if not admin (handled by middleware, but double-check)
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center text-black mt-8">
        You do not have permission to access this page.
      </div>
    );
  }

  const handleCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setEditingUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const result: ActionResult = await deleteUser(id);
    if (result.ok) {
      showToast(result.message || 'User deleted successfully');
      mutate();
    } else {
      showToast(result.message || 'Failed to delete user', 'error');
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let result: ActionResult;
      if (editingUser) {
        result = await updateUser(editingUser.id, data);
      } else {
        result = await createUser(data);
      }

      if (result.ok) {
        showToast(result.message || 'User saved successfully');
        setIsDialogOpen(false);
        setEditingUser(null);
        mutate();
      } else {
        showToast(result.message || 'Failed to save user', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (data: any) => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const result: ActionResult = await resetUserPassword(editingUser.id, data.password);
      if (result.ok) {
        showToast(result.message || 'Password reset successfully');
        setIsPasswordDialogOpen(false);
        setEditingUser(null);
      } else {
        showToast(result.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            user.role === 'ADMIN'
              ? 'bg-club-primary text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user) => formatDate(user.createdAt),
    },
  ];

  const rowActions = (user: User) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(user)}
        className="text-club-primary hover:text-club-primary-dark"
        aria-label="Edit user"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleResetPassword(user)}
        className="text-amber-500 hover:text-amber-600"
        aria-label="Reset password"
        title="Reset password"
      >
        <KeyIcon className="h-5 w-5" />
      </button>
      {session?.user?.id !== user.id.toString() && (
        <button
          onClick={() => handleDelete(user.id)}
          className="text-rose-500 hover:text-rose-600"
          aria-label="Delete user"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          <DataTable data={users} columns={columns} rowActions={rowActions} />
        </div>

        <FormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingUser ? 'Edit User' : 'Create User'}
        >
          <UserForm
            onSubmit={handleSubmit}
            defaultValues={editingUser || undefined}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingUser(null);
            }}
            isLoading={isSubmitting}
          />
        </FormDialog>

        <FormDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          title="Reset Password"
        >
          <UserForm
            onSubmit={handlePasswordReset}
            defaultValues={editingUser || undefined}
            onCancel={() => {
              setIsPasswordDialogOpen(false);
              setEditingUser(null);
            }}
            isLoading={isSubmitting}
            isPasswordReset={true}
          />
        </FormDialog>

        <Toast
          open={toast.open}
          onOpenChange={(open) => setToast({ ...toast, open })}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
        />
      </div>
    </>
  );
}

