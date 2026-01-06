"use client";

import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import * as React from "react";

const STORAGE_KEY = "ingameUsername";

function MinecraftAvatar({
  avatarUrl,
  initials,
  name,
  className,
}: {
  avatarUrl: string;
  initials: string;
  name: string;
  className?: string;
}) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  return (
    <div
      className={cn(
        "bg-muted relative flex size-8 shrink-0 overflow-hidden rounded-lg",
        className
      )}
    >
      {!hasError ? (
        <img
          src={avatarUrl}
          alt={name}
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-muted-foreground flex size-full items-center justify-center text-xs font-medium">
          {initials || "?"}
        </span>
      )}
    </div>
  );
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    avatar: string;
  };
}) {
  const [displayName, setDisplayName] = React.useState(user.name);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDisplayName(stored);
    }

    function handleUpdate() {
      const latest = window.localStorage.getItem(STORAGE_KEY);
      if (latest) {
        setDisplayName(latest);
      }
    }

    window.addEventListener("ingame-username-updated", handleUpdate);
    return () => {
      window.removeEventListener("ingame-username-updated", handleUpdate);
    };
  }, [user.name]);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const usernameForAvatar = (displayName || "steve").trim().replace(/\s+/g, "");
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(
    usernameForAvatar || "steve"
  )}/100`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <button
          type="button"
          className="hover:bg-sidebar-accent focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
          onClick={() => {
            window.dispatchEvent(new Event("ingame-username-edit"));
          }}
          aria-label="Change ingame username"
        >
          <MinecraftAvatar
            avatarUrl={avatarUrl}
            initials={initials}
            name={displayName}
            className="h-10 w-10"
          />
          <div className="min-w-0 text-left text-sm leading-tight">
            <span className="block truncate font-medium">{displayName}</span>
          </div>
        </button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
