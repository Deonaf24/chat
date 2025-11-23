"use client";

import { Menu } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import LaunchUI from "../../logos/launch-ui";
import { Button, ButtonProps } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href?: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
  onClick?: () => void;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <LaunchUI />,
  name = "Socratica",
  homeUrl = "/",
  mobileLinks = [
    { text: "Home", href: "/" },
  ],
  showNavigation = true,
  customNavigation,
  actions = [],
  className,
}: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
              {name}
            </a>
          </NavbarLeft>
          <NavbarRight>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  <a
                    href={homeUrl}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <span>{name}</span>
                  </a>
                  {mobileLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </a>
                  ))}
                  {actions.map((action, index) => (
                    <Button
                      key={`mobile-${index}`}
                      variant={action.variant ?? "secondary"}
                      onClick={action.onClick}
                      asChild={Boolean(action.href)}
                    >
                      {action.href ? (
                        <a href={action.href} className="justify-start">
                          {action.text}
                        </a>
                      ) : (
                        <span className="justify-start">{action.text}</span>
                      )}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {showNavigation ? (
              customNavigation ?? (
                <div className="hidden items-center gap-2 md:flex">
                  {actions.map((action, index) =>
                    (action.isButton ?? true) ? (
                      <Button
                        key={`action-${index}`}
                        variant={action.variant ?? "outline"}
                        onClick={action.onClick}
                        asChild={Boolean(action.href)}
                        className="gap-2"
                      >
                        {action.href ? (
                          <a href={action.href}>{action.text}</a>
                        ) : (
                          <span>{action.text}</span>
                        )}
                      </Button>
                    ) : (
                      <a
                        key={`action-${index}`}
                        href={action.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {action.text}
                      </a>
                    )
                  )}
                </div>
              )
            ) : null}
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
