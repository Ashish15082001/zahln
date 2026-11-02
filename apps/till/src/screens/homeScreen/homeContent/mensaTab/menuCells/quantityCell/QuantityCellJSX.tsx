import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";

export interface QuantityCellJSXProps {
  // The buttons name the dish, like the tick boxes.
  decreaseLabel: string;
  increaseLabel: string;
  isDecreaseDisabled: boolean;
  isIncreaseDisabled: boolean;
  quantity: number;
  handleDecrease: () => void;
  handleIncrease: () => void;
}

const QuantityCellJSX: FC<QuantityCellJSXProps> = ({
  decreaseLabel,
  increaseLabel,
  isDecreaseDisabled,
  isIncreaseDisabled,
  quantity,
  handleDecrease,
  handleIncrease,
}) => (
  // -my-3 takes back the cell's padding, so a ticked row stays 48 px tall
  // rather than growing to fit the 48 px buttons.
  <div className="-my-3 flex items-center justify-end gap-2">
    <Button
      aria-label={decreaseLabel}
      disabled={isDecreaseDisabled}
      size="icon"
      variant="outline"
      onClick={handleDecrease}
    >
      <HugeiconsIcon aria-hidden icon={MinusSignIcon} />
    </Button>
    {/* An output is a live region, so TalkBack reads the new number after
        each tap. */}
    <output className="w-8 text-center tabular-nums">{quantity}</output>
    <Button
      aria-label={increaseLabel}
      disabled={isIncreaseDisabled}
      size="icon"
      variant="outline"
      onClick={handleIncrease}
    >
      <HugeiconsIcon aria-hidden icon={PlusSignIcon} />
    </Button>
  </div>
);

export default QuantityCellJSX;
