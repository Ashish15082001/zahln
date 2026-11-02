import type { FC } from "react";
import PaymentList from "../../../components/paymentList/PaymentList";
import type { PaymentListState } from "../../../components/paymentList/PaymentListJSX";
import ScreenTitleRow, {
  type RefreshButtonState,
} from "../../../components/screenTitleRow/ScreenTitleRow";

export interface AttentionContentJSXProps {
  description: string;
  // Null while there is nothing to refresh.
  refreshButtonState: RefreshButtonState | null;
  state: PaymentListState;
  title: string;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

// The payment search's list with the reasons beside each status, and no
// filters: the server picks these payments. An empty list here is good news,
// so it says that rather than "no payments found".
const AttentionContentJSX: FC<AttentionContentJSXProps> = ({
  description,
  refreshButtonState,
  state,
  title,
  handleLoadMore,
  handleRefresh,
}) => (
  <>
    <ScreenTitleRow
      description={description}
      refreshButtonState={refreshButtonState}
      title={title}
      handleRefresh={handleRefresh}
    />
    <PaymentList
      emptyKind="allClear"
      isReasonsShown
      state={state}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  </>
);

export default AttentionContentJSX;
