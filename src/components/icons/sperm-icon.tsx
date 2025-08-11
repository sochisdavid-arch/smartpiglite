import * as React from 'react';
import { cn } from '@/lib/utils';

export function SpermIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <circle cx="6" cy="6" r="4" />
      <path d="M6 10v4c0 4.418 3.582 8 8 8s8-3.582 8-8v-4" />
    </svg>
  );
}
