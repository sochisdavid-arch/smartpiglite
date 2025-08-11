
import * as React from 'react';
import { cn } from '@/lib/utils';

export function LittlePigIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
        <path d="M15.14 14.12a5 5 0 0 1-8.28 0" />
        <path d="M20.2 11a5 5 0 0 0-8.2-2.73" />
        <path d="M3.8 11a5 5 0 0 1 8.2-2.73" />
        <path d="m12 15-1-1" />
        <path d="M18.37 7.63c.09.17.15.34.2.5" />
        <path d="m5.43 7.63-.2.5" />
        <path d="M12 2v2" />
        <path d="M12 19v2" />
    </svg>
  );
}
