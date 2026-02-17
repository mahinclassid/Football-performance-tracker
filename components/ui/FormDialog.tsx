'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { themeClasses } from '@/lib/theme-classes';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormDialog({ open, onOpenChange, title, children, className }: FormDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
            'bg-white rounded-2xl shadow-xl z-50',
            'w-full max-w-7xl max-h-[95vh] overflow-y-auto',
            'p-6',
            className
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className={`text-2xl font-bold ${themeClasses.text.heading}`}>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-500 hover:text-black transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

