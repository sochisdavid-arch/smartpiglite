import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', className)}
      {...props}
    >
      <path d="M15.14,13.25a1,1,0,0,0-1.28,0,5.76,5.76,0,0,1-7.72,0A1,1,0,0,0,5,14.41a7.71,7.71,0,0,0,10.28,0,1,1,0,0,0-.14-1.16Z" />
      <path d="M11.14 10.24a.5.5 0 10-.5.5.5.5 0 00.5-.5zM14.36 10.24a.5.5 0 10-.5.5.5.5 0 00.5-.5z" />
      <path d="M15.5,2A8.5,8.5,0,0,0,7,10.5c0,4.89-4.8,3.5-4.8,3.5A1.2,1.2,0,0,0,1,15.19V17.5a2.5,2.5,0,0,0,2.5,2.5h17A2.5,2.5,0,0,0,23,17.5V15.19A1.2,1.2,0,0,0,21.8,14S17,15.39,17,10.5A8.5,8.5,0,0,0,15.5,2Z" />
    </svg>
  );
}
