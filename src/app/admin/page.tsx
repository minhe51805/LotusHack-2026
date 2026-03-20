import { MessageSquare } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
          <MessageSquare size={24} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
          Select a session from the sidebar
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
          or open the chat to start a new one
        </p>
      </div>
    </div>
  );
}
