
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
        <path d="M15.14 14.12a5 5 0 0 1-8.28 0" />
        <path d="M12 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8" />
        <path d="M12 2v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 6.34 1.41-1.41" />
        <path d="M18 12h2" />
        <path d="M4 12H2" />
        <path d="M12 18v2" />
        <path d="M7.8 15.75c0-1.25.84-2.43 2.1-2.7C11.25 12.82 12 13.5 12 15h0s0 0 0 0" />
        <path d="M12 15c0-1.5 1.05-2.68 2.35-2.95.12-.02.24-.05.35-.05.83 0 1.5.67 1.5 1.5v.5" />
        <path d="M12 12v3" />
    </svg>
  );
}
