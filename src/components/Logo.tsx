import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', className)}
      {...props}
    >
      <path d="M16 6.5A5.5 5.5 0 1 1 5.5 12" />
      <path d="M12 12v-2" />
      <path d="M18.5 10.5a2.5 2.5 0 1 1-5 0" />
      <path d="M18.5 10.5h-13" />
      <path d="M4 16.5a2.5 2.5 0 1 0 5 0" />
      <path d="M4 16.5h13.5" />
      <path d="M12 12a6 6 0 0 0-6-6" />
    </svg>
  );
}
