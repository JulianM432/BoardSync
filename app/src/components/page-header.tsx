import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <h1 className="truncate text-sm font-semibold">{title}</h1>
      {children}
    </header>
  );
};
