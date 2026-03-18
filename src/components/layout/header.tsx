"use client";

import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user?.name ?? "..."}
          </p>
          <p className="text-xs text-gray-500">{user?.role ?? ""}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
