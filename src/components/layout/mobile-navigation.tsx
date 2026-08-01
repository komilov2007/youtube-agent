"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppSidebar } from "./app-sidebar";

type MobileNavigationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MobileNavigation({ open, onOpenChange }: MobileNavigationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="mobile-navigation"
        className="top-0 left-0 h-svh w-[min(20rem,calc(100%-2rem))] max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-y-0 border-l-0 p-0 data-[state=closed]:-translate-x-full data-[state=closed]:scale-100 data-[state=open]:translate-x-0 sm:w-80"
      >
        <DialogTitle className="sr-only">Navigation</DialogTitle>
        <DialogDescription className="sr-only">
          Navigate between areas of the Content Agent workspace.
        </DialogDescription>
        <AppSidebar
          className="w-full border-r-0"
          showCollapseControl={false}
          onNavigate={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { MobileNavigation };
