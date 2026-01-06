"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "ingameUsername";

export function IngameUsernamePrompt() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setValue(stored);
    } else {
      setIsOpen(true);
    }

    function handleEdit() {
      const latest = window.localStorage.getItem(STORAGE_KEY);
      if (latest) {
        setValue(latest);
      }
      setIsOpen(true);
    }

    window.addEventListener("ingame-username-edit", handleEdit);
    return () => {
      window.removeEventListener("ingame-username-edit", handleEdit);
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    window.dispatchEvent(new Event("ingame-username-updated"));
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="bg-background w-full max-w-sm rounded-lg border p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Enter your ingame username</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          This is used to personalize your admin session.
        </p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            autoFocus
            placeholder="Ingame username"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button type="submit">Continue</Button>
        </form>
      </div>
    </div>
  );
}
