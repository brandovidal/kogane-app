import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/ui/sheet";
import { withQuery } from "@/shared/api/query";
import { NavTree } from "./NavTree";

interface MobileNavProps {
  currentPath: string;
}

// The same menu (D41) in a drawer on the phone
function MobileNavView({ currentPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
        <SheetTitle className="flex h-16 items-center gap-2 border-b px-6">
          <img src="/kogane.webp" alt="" className="h-9 w-9 shrink-0 object-contain" />
          <span className="text-lg font-bold">Kogane</span>
        </SheetTitle>
        <NavTree currentPath={currentPath} />
      </SheetContent>
    </Sheet>
  );
}

export const MobileNav = withQuery(MobileNavView);
