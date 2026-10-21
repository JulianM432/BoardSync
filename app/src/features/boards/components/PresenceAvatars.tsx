import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getUserColor } from "@/lib/user-color";
import type { PresenceUser } from "@/lib/socket";

const MAX_VISIBLE = 5;

type PresenceAvatarsProps = {
  users: PresenceUser[];
  currentUserId: string;
};

export const PresenceAvatars = ({
  users,
  currentUserId,
}: PresenceAvatarsProps) => {
  if (users.length === 0) {
    return null;
  }

  const sorted = users.toSorted((a, b) =>
    a.userId === currentUserId ? -1 : b.userId === currentUserId ? 1 : 0,
  );
  const visible = sorted.slice(0, MAX_VISIBLE);
  const hidden = sorted.length - visible.length;

  return (
    <ul
      aria-label="Usuarios conectados"
      className="flex items-center -space-x-1.5"
    >
      {visible.map((user) => {
        const label =
          user.userId === currentUserId
            ? `${user.username} (vos)`
            : user.username;
        return (
          <li key={user.userId}>
            <Tooltip>
              <TooltipTrigger
                aria-label={label}
                className="flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white uppercase ring-2 ring-background"
                style={{ backgroundColor: getUserColor(user.userId) }}
              >
                {user.username.charAt(0)}
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
      {hidden > 0 && (
        <li className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">
          +{hidden}
        </li>
      )}
    </ul>
  );
};
