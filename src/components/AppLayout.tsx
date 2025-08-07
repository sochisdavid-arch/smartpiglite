
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  LogOut,
  User,
  HeartPulse,
  Baby,
  GanttChartSquare,
  Beef,
  Boxes,
  Users,
  Landmark,
  Stethoscope,
  LineChart,
  ChevronDown,
  UserSearch,
  Activity,
  BarChart2,
  GitCommitHorizontal,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo';
import { cn } from "@/lib/utils";


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { href: '/gestation', label: 'Gestación', icon: HeartPulse },
    { href: '/lactation', label: 'Lactancia', icon: Baby },
    { href: '/verracos', label: 'Verracos', icon: GitCommitHorizontal },
    { href: '/precebo', label: 'Precebo', icon: GanttChartSquare },
    { href: '/ceba', label: 'Ceba', icon: Beef },
    { href: '/inventory', label: 'Inventario', icon: Boxes },
    { href: '/personnel', label: 'Personal', icon: Users },
    { href: '/finance', label: 'Financiero', icon: Landmark },
    { href: '/pig-doctor', label: 'PigDoctor AI', icon: Stethoscope },
    { href: '/forms', label: 'Formularios', icon: ClipboardList },
  ];
  
  const gestationAnalysisMenuItems = [
      { href: '/analysis/gestation-performance', label: 'Desempeño Gestación' },
      { href: '/analysis/reproductive-loss', label: 'Pérdida Reproductiva' },
      { href: '/analysis/service-analysis', label: 'Análisis de Servicios' },
      { href: '/analysis/farrowing-rate', label: 'Análisis Tasa de Parición' },
      { href: '/analysis/reproductive-loss-analysis', label: 'Análisis Pérdidas Reproductivas' },
      { href: '/analysis/sow-card', label: 'Ficha de la Madre' },
  ];
  
  const lactationAnalysisMenuItems = [
       { href: '/analysis/maternity-performance', label: 'Análisis Potencial Productivo' },
       { href: '/analysis/farrowing-forecast', label: 'Previsión de Parto' },
       { href: '/analysis/weaning-forecast', label: 'Previsión de Destete' },
       { href: '/analysis/birth-analysis', label: 'Análisis de Nacimientos' },
       { href: '/analysis/lactation-analysis', label: 'Análisis de Destetados' },
       { href: '/analysis/mortality-analysis', label: 'Análisis de mortalidad' },
  ];
  
  const productionAnalysisMenuItems = [
       { href: '/analysis/liquidated-batches', label: 'Lotes Liquidados' },
  ];

  const isGestationAnalysisActive = gestationAnalysisMenuItems.some(item => pathname.startsWith(item.href));
  const isLactationAnalysisActive = lactationAnalysisMenuItems.some(item => pathname.startsWith(item.href));
  const isProductionAnalysisActive = productionAnalysisMenuItems.some(item => pathname.startsWith(item.href));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7" />
            <span className="font-bold text-lg">SmartPig</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && item.href !== '/'}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                 <Collapsible>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className="justify-between"
                            variant={isGestationAnalysisActive ? "default" : "ghost"}
                            isActive={isGestationAnalysisActive}
                            >
                            <div className="flex items-center gap-2">
                                <GitCommitHorizontal />
                                <span>Análisis Gestación</span>
                            </div>
                            <ChevronDown className="size-4 shrink-0 transition-transform ease-in-out group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {gestationAnalysisMenuItems.map((item) => (
                                <SidebarMenuSubItem key={item.href}>
                                    <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <Collapsible>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className="justify-between"
                            variant={isLactationAnalysisActive ? "default" : "ghost"}
                            isActive={isLactationAnalysisActive}
                            >
                            <div className="flex items-center gap-2">
                                <Activity />
                                <span>Análisis Lactancia</span>
                            </div>
                            <ChevronDown className="size-4 shrink-0 transition-transform ease-in-out group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {lactationAnalysisMenuItems.map((item) => (
                                <SidebarMenuSubItem key={item.href}>
                                    <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
             <SidebarMenuItem>
                 <Collapsible>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className="justify-between"
                            variant={isProductionAnalysisActive ? "default" : "ghost"}
                            isActive={isProductionAnalysisActive}
                            >
                            <div className="flex items-center gap-2">
                                <LineChart />
                                <span>Análisis de Precebo y Ceba</span>
                            </div>
                            <ChevronDown className="size-4 shrink-0 transition-transform ease-in-out group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {productionAnalysisMenuItems.map((item) => (
                                <SidebarMenuSubItem key={item.href}>
                                    <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <div className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-sidebar-accent">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                     <div className="group-data-[collapsible=icon]:hidden flex flex-col">
                        <span className="text-sm font-semibold text-sidebar-foreground">Admin de la Granja</span>
                        <span className="text-xs text-muted-foreground">admin@smartpig.com</span>
                    </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin de la Granja</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@smartpig.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User className="mr-2 h-4 w-4" />Perfil</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/"><LogOut className="mr-2 h-4 w-4" />Cerrar sesión</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              {/* You can add breadcrumbs or page titles here */}
            </div>
            {/* Desktop user menu can go here if needed */}
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
