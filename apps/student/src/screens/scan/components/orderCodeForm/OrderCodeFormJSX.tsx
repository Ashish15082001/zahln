import { Button } from "@zahln/ui/components/button";
import { Input } from "@zahln/ui/components/input";
import { Label } from "@zahln/ui/components/label";
import { useId, type FC, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

export interface OrderCodeFormJSXProps {
  isCodeInvalid: boolean;
  orderCode: string;
  handleChangeOrderCode: (orderCode: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const OrderCodeFormJSX: FC<OrderCodeFormJSXProps> = ({
  isCodeInvalid,
  orderCode,
  handleChangeOrderCode,
  handleSubmit,
}) => {
  const { t } = useTranslation("student");
  const id = useId();
  const inputId = `${id}-input`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // The error is described only while it shows: pointing at nothing is worse
  // than not pointing.
  const describedBy = isCodeInvalid ? `${hintId} ${errorId}` : hintId;

  return (
    // A real form, so the keyboard's Enter key submits it.
    <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 text-left">
        <Label htmlFor={inputId}>{t("scan.codeLabel")}</Label>
        {/* Codes are lowercase letters and digits: no capitals, corrections
            or suggestions from the keyboard. */}
        <Input
          aria-describedby={describedBy}
          aria-invalid={isCodeInvalid}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          id={inputId}
          required
          spellCheck={false}
          value={orderCode}
          onChange={(event) => handleChangeOrderCode(event.target.value)}
        />
        <p className="text-sm text-muted-foreground" id={hintId}>
          {t("scan.codeHint")}
        </p>
        {isCodeInvalid && (
          <p className="text-sm text-destructive" id={errorId} role="alert">
            {t("scan.codeInvalid")}
          </p>
        )}
      </div>
      <Button className="w-full" type="submit">
        {t("scan.openOrder")}
      </Button>
    </form>
  );
};

export default OrderCodeFormJSX;
