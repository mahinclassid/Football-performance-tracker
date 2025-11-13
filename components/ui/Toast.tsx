'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { themeClasses } from '@/lib/theme-classes';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'success' | 'error';
  duration?: number;
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  variant = 'success',
  duration = 5000,
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        duration={duration}
        className={cn(
          'bg-white rounded-lg shadow-lg p-4 pr-8',
          'border border-gray-200',
          'data-[state=open]:animate-slideIn',
          'data-[state=closed]:animate-hide',
          'pointer-events-auto'
        )}
      >
        <div className="flex items-start gap-3">
          {variant === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-club-primary flex-shrink-0 mt-0.5" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <ToastPrimitive.Title className={`text-sm font-semibold ${themeClasses.text.primary}`}>
              {title}
            </ToastPrimitive.Title>
            {description && (
              <ToastPrimitive.Description className={`text-sm ${themeClasses.text.primary} mt-1`}>
                {description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="absolute top-2 right-2 text-gray-500 hover:text-black">
            <XMarkIcon className="h-4 w-4" />
          </ToastPrimitive.Close>
        </div>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed top-0 right-0 z-[100] flex flex-col p-6 gap-2 w-full max-w-sm" />
    </ToastPrimitive.Provider>
  );
}

// Toast hook for easier usage
export function useToast() {
  const [toast, setToast] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: 'success' | 'error';
  }>({
    open: false,
    title: '',
    variant: 'success',
  });

  const showToast = (
    title: string,
    variant: 'success' | 'error' = 'success',
    description?: string
  ) => {
    setToast({ open: true, title, description, variant });
  };

  return {
    toast,
    showToast,
    setToast,
  };
}

