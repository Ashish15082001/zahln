import type { FC } from "react";
import CreateOrderButtonJSX, {
  type CreateOrderButtonJSXProps,
} from "./CreateOrderButtonJSX";

export type CreateOrderButtonProps = CreateOrderButtonJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const CreateOrderButton: FC<CreateOrderButtonProps> = (props) => (
  <CreateOrderButtonJSX {...props} />
);

export default CreateOrderButton;
