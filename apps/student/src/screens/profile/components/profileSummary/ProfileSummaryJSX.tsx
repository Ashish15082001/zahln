import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback } from "@zahln/ui/components/avatar";
import { Badge } from "@zahln/ui/components/badge";
import type { FC } from "react";

export interface ProfileSummaryJSXProps {
  displayName: string;
  nameInitial: string;
  priceGroupLabel: string;
}

const ProfileSummaryJSX: FC<ProfileSummaryJSXProps> = ({
  displayName,
  nameInitial,
  priceGroupLabel,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {/* Hidden from TalkBack: the letter only repeats the name under it.
          The server may send an empty name, so a person icon then, not an
          empty circle. */}
      <Avatar aria-hidden className="size-20">
        <AvatarFallback className="text-3xl font-semibold">
          {nameInitial === "" ? (
            <HugeiconsIcon className="size-10" icon={UserIcon} />
          ) : (
            nameInitial
          )}
        </AvatarFallback>
      </Avatar>
      {/* wrap-anywhere: a long name with no space in it wraps instead of
          widening the page. */}
      <p className="text-xl font-semibold wrap-anywhere">{displayName}</p>
      {/* Says what the group means, the prices paid, not only its name. */}
      <Badge variant="secondary">{priceGroupLabel}</Badge>
    </div>
  );
};

export default ProfileSummaryJSX;
