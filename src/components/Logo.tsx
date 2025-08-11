import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('text-primary', className)}
      {...props}
    >
      <g fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Pig Face */}
        <path d="M15.33,21.67a7.8,7.8,0,0,1-6.66,0" fill="hsl(var(--primary-foreground))"/>
        <path d="M15.83,18.42a8,8,0,0,1-7.66,0c-2.42-1.1-4.17-3.36-4.17-6V11.2a8,8,0,0,1,8-8h0a8,8,0,0,1,8,8v1.2C19.83,15.06,18.25,17.32,15.83,18.42Z" fill="hsl(var(--primary-foreground))"/>
        <path d="M18,10.42a1,1,0,0,1-2,0,4,4,0,0,0-8,0,1,1,0,0,1-2,0,6,6,0,0,1,12,0Z" fill="hsl(var(--secondary))" stroke="hsl(var(--secondary-foreground))" />
        <circle cx="9" cy="9.42" r="0.5" fill="hsl(var(--foreground))" stroke="none" />
        <circle cx="15" cy="9.42" r="0.5" fill="hsl(var(--foreground))" stroke="none" />
        <path d="M12,13.42a3,3,0,0,1,3-3h0a3,3,0,0,1,3,3v2a3,3,0,0,1-3,3h0a3,3,0,0,1-3-3Z" fill="hsl(var(--secondary))" stroke="hsl(var(--secondary-foreground))" />
        <circle cx="11" cy="13.92" r="0.5" fill="hsl(var(--foreground))" stroke="none" />
        <circle cx="13" cy="13.92" r="0.5" fill="hsl(var(--foreground))" stroke="none" />
        <path d="M10,19.42a2,2,0,0,1,4,0" />

        {/* Graduation Cap */}
        <path d="M5,10.5l7-4,7,4L12,14.5Z" fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))"/>
        <path d="M18.5,10.5v2.67a0.5,0.5,0,0,1-1,0V11" stroke="hsl(var(--foreground))"/>
      </g>
    </svg>
  );
}
