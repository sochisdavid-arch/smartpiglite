
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
        <path d="M15 11h.01" />
        <path d="M11 11h.01" />
        <path d="M12 2c-2.76 0-5 2.24-5 5 0 1.2.42 2.29 1.13 3.15-1.55.6-2.77 1.95-3.03 3.63h13.8c-.26-1.68-1.48-3.03-3.03-3.63.7-.86 1.12-1.95 1.12-3.15 0-2.76-2.24-5-5-5z" />
        <path d="M5.5 16.5c0-1.66 1.34-3 3-3 .95 0 1.82.44 2.4 1.15.58-.7 1.45-1.15 2.4-1.15 1.66 0 3 1.34 3 3" />
        <path d="M16.5 22c0-1.1-.9-2-2-2h-5c-1.1 0-2 .9-2 2" />
    </svg>
  );
}
