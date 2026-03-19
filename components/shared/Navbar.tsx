import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { LogOut, Users, User, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { Dropdown } from "react-day-picker";

interface NavbarProps {
  role: "STUDENT" | "TEACHER";
  onLogout: () => void;
}

export function Navbar({ role, onLogout }: NavbarProps) {
  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <img src="/cheeto_learn_logo.png" className="h-10" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            {role === "TEACHER"
              ? <><Users className="w-4 h-4" /> Profesor</>
              : <><User className="w-4 h-4" /> Alumno</>
            }
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More Options">
              <MoreHorizontalIcon/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Button variant="destructive" onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}