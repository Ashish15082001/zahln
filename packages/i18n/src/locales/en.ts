// English is the source of truth for keys. No `as const`, so every leaf types
// as `string` and de.ts can be held to the same shape without matching text.
const en = {
  common: {
    continue: "Continue",
    version: "Version {{version}}",
  },
  student: {
    appName: "Zahln",
    welcome: {
      title: "Welcome to Zahln",
      description: "Pay for your mensa meal with your phone.",
    },
    login: {
      title: "Log in",
      description:
        "Pick a test user. The same order costs each of them a different amount.",
      submit: "Log in",
      submitting: "Logging in…",
      testUsers: {
        student: { title: "Student", description: "Pays student prices." },
        staff: { title: "Staff", description: "Pays staff prices." },
        guest: { title: "Guest", description: "Pays guest prices." },
      },
      errors: {
        wrongPassword: "Wrong username or password.",
        notPayer: "This account can't use the Zahln app.",
        unreachable: "Can't reach the server. Try again.",
        badCandidate: "This build has a wrong candidate ID.",
        unknown: "Something went wrong. Try again.",
      },
    },
    home: {
      greeting: "Hello, {{name}}",
      profile: "Profile",
      payments: {
        title: "Your payments",
        loading: "Loading your payments…",
        refresh: "Refresh",
        refreshing: "Refreshing…",
        refreshFailed: "Couldn't refresh. These are your payments from before.",
        errorTitle: "Your payments couldn't be loaded",
        errorDescription: "Check your connection and try again.",
        retry: "Try again",
        retrying: "Trying again…",
        emptyTitle: "No payments yet",
        emptyDescription: "Meals you pay for with Zahln show up here.",
        loadMore: "Load more",
        loadingMore: "Loading more…",
        loadMoreFailed: "More payments couldn't be loaded.",
        refunded: "{{amount}} refunded",
        refundPending: "Refund of {{amount}} on its way",
      },
      scan: {
        button: "Scan QR",
        installing: "Getting the scanner ready…",
        notAnOrderTitle: "Not a Zahln code",
        notAnOrderDescription:
          "This QR code isn't for paying at the mensa. Scan the code on the till's screen.",
        scanAgain: "Scan again",
        close: "Close",
      },
    },
    // The app's own camera scanner, and typing the code as the last resort.
    scan: {
      title: "Scan QR",
      cancel: "Cancel",
      back: "Back",
      starting: "Starting the camera…",
      hint: "Point the camera at the QR code on the till's screen.",
      notAnOrder:
        "That's not a Zahln code. Point the camera at the till's QR code.",
      cameraDeniedTitle: "Camera access is off",
      cameraDeniedDescription:
        "Allow the camera in Settings, then try again. Or type the code under the till's QR code.",
      openSettings: "Open settings",
      tryAgain: "Try again",
      unavailableTitle: "This device can't scan",
      unavailableDescription:
        "Type the code shown under the QR code on the till's screen.",
      codeLabel: "Order code",
      codeHint: "It's under the QR code on the till's screen.",
      codeInvalid: "That isn't an order code. Check it and try again.",
      openOrder: "Open order",
    },
    // The order the payer scanned. The order and pay screens share these.
    order: {
      title: "Order",
      back: "Back",
      loading: "Loading the order…",
      notFoundTitle: "Order not found",
      notFoundDescription:
        "Check the code, or scan the QR code on the till's screen again.",
      errorTitle: "The order couldn't be loaded",
      errorDescription: "Check your connection and try again.",
      retry: "Try again",
      retrying: "Trying again…",
      priceGroup: {
        student: "Student price",
        staff: "Staff price",
        guest: "Guest price",
      },
      payWithin: "Pay within {{time}}",
      timeUp: "Time's up. Checking the order…",
      items: "Items",
      unitPrice: "{{quantity}} × {{unitPrice}}",
      total: "Total",
      payingTitle: "Payment being checked",
      payingYoursDescription: "Your payment for this order is being checked.",
      payingDescription: "A payment for this order is being checked.",
      paidTitle: "Already paid",
      paidYoursDescription: "You paid this order.",
      paidDescription: "This order has already been paid.",
      expiredTitle: "Order expired",
      expiredDescription: "Nothing was paid. Ask the cashier for a new order.",
      seePayment: "See the payment",
    },
    // Paying a scanned order: its details, Pay, and every answer to Pay.
    pay: {
      title: "Pay",
      back: "Back",
      done: "Done",
      pay: "Pay {{amount}}",
      // Before the order is on screen there is no amount to name yet.
      payNoAmount: "Pay",
      paying: "Paying…",
      // While the phone's own prompt asks for a fingerprint, the face or the
      // PIN. Nothing has been sent yet.
      checkingPayer: "Confirming…",
      // The title of that prompt. Android draws it, so the payer sees the
      // amount in the phone's own dialog.
      payerCheckTitle: "Pay {{amount}}",
      checkAgain: "Check again",
      // The payer's own payment for this order.
      ownPayment: {
        pendingTitle: "Payment being checked",
        pendingDescription: "Your payment for this order is being checked.",
        confirmedTitle: "Paid",
        confirmedDescription: "You paid this order.",
        // After 30 seconds the page stops asking; the payment can stay
        // pending for minutes.
        longPendingTitle: "Still being checked",
        longPendingDescription:
          "This can take a few minutes. You will find the result in your payments.",
        refresh: "Refresh",
        refreshing: "Refreshing…",
      },
      // One per answer to Pay that isn't a payment going ahead. A closed
      // prompt has none: the payer closed it on purpose.
      messages: {
        payerLockedOut: {
          title: "Too many tries",
          description:
            "Nothing was paid. Wait a moment or use your phone's PIN, then pay again.",
        },
        payerCheckFailed: {
          title: "Couldn't confirm it's you",
          description: "Nothing was paid. Try again.",
        },
        declined: {
          title: "Payment declined",
          description: "Nothing was paid. You can pay again.",
        },
        unconfirmed: {
          title: "Payment not confirmed",
          description:
            "It may have gone through. Check again finds out, and never pays twice.",
        },
        priceChanged: {
          title: "The price changed",
          description: "Check the new amount, then pay.",
        },
        orderExpired: {
          title: "Order expired",
          description: "Nothing was paid. Ask the cashier for a new order.",
        },
        orderPaid: {
          title: "Already paid",
          description: "This order has already been paid.",
        },
        orderPaying: {
          title: "Payment being checked",
          description: "A payment for this order is being checked.",
        },
        orderNotFound: {
          title: "Order not found",
          description: "Scan the QR code on the till's screen again.",
        },
        updateRequired: {
          title: "Update the app",
          description:
            "This version can't pay any more. Update Zahln, then pay.",
        },
        paymentsPaused: {
          title: "Payments are paused",
          description: "Try again in a few minutes.",
        },
        failed: {
          title: "The payment didn't go through",
          description: "Try again.",
        },
      },
    },
    // Shared by the list and the detail screen, so a status reads the same on
    // both.
    paymentStatus: {
      pending: "Being checked",
      confirmed: "Paid",
      declined: "Declined",
    },
    refundStatus: {
      pending: "Being processed",
      completed: "Refunded",
      failed: "Failed",
    },
    paymentDetail: {
      title: "Payment",
      back: "Back",
      refresh: "Refresh",
      refreshing: "Refreshing…",
      refreshFailed: "Couldn't refresh. This is the payment from before.",
      loading: "Loading the payment…",
      loadingMore: "Loading refunds and history…",
      notFoundTitle: "Payment not found",
      notFoundDescription:
        "It doesn't exist, or it belongs to another account.",
      errorTitle: "The payment couldn't be loaded",
      errorDescription: "Check your connection and try again.",
      retry: "Try again",
      retrying: "Trying again…",
      items: "Items",
      unitPrice: "{{quantity}} × {{unitPrice}}",
      total: "Total",
      refunded: "{{amount}} refunded",
      refundPending: "Refund of {{amount}} on its way",
      refunds: "Refunds",
      refundReason: "Reason: {{reason}}",
      history: "History",
      events: {
        payment_created: "Payment started",
        payment_confirmed: "Payment confirmed",
        payment_declined: "Payment declined",
        refund_requested: "Refund requested",
        refund_completed: "Refund completed",
        refund_failed: "Refund failed",
        other: "Other change",
      },
      paymentId: "Payment ID: {{paymentId}}",
    },
    profile: {
      title: "Profile",
      back: "Back",
      priceGroup: {
        student: "Student prices",
        staff: "Staff prices",
        guest: "Guest prices",
      },
      theme: {
        title: "App theme",
        description: "Light or dark",
        system: "Same as phone",
        light: "Light",
        dark: "Dark",
      },
      language: {
        title: "App language",
        description: "English or German",
        device: "Same as phone",
        en: "English",
        de: "Deutsch",
      },
      logOut: {
        title: "Log out",
        description: "Ends your session on this phone",
      },
    },
  },
  till: {
    appName: "Zahln Till",
    welcome: {
      title: "Welcome to Zahln",
      description: "Ring up orders and take payments at the mensa.",
    },
    login: {
      title: "Log in",
      description: "Log in with your cashier account.",
      username: "Username",
      password: "Password",
      submit: "Log in",
      submitting: "Logging in…",
      errors: {
        wrongPassword: "Wrong username or password.",
        notCashier: "This account can't use the till.",
        unreachable: "Can't reach the server. Try again.",
        badCandidate: "This build has a wrong candidate ID.",
        unknown: "Something went wrong. Try again.",
      },
    },
    home: {
      greeting: "Hello, {{name}}",
      logOut: "Log out",
      tabs: {
        mensa: "Mensa",
        payments: "Payments",
      },
      mensa: {
        loading: "Loading the menu…",
        error: "The menu couldn't be loaded.",
        retry: "Try again",
        retrying: "Trying again…",
        notFound: "Your mensa isn't on the server's list.",
        emptyMenu: "No dishes on the menu.",
        dish: "Dish",
        student: "Student",
        staff: "Staff",
        guest: "Guest",
        selectAll: "Select all dishes",
        selectDish: "Select {{dish}}",
        quantity: "Quantity",
        oneMore: "One more {{dish}}",
        oneFewer: "One fewer {{dish}}",
        createOrder: "Create order",
      },
      order: {
        creatingTitle: "Creating order…",
        creatingDescription: "This takes a moment.",
        unconfirmedTitle: "Couldn't confirm the order",
        unconfirmedDescription:
          "It may have been made. Try again checks, and never makes it twice.",
        failedTitle: "Order not created",
        failedDescription: "Nothing was made. You can try again.",
        tryAgain: "Try again",
        cancel: "Cancel",
        scanToPay: "Scan to Pay",
        qrLabel: "QR code to pay this order",
        orderCode: "Code: {{orderId}}",
        waiting: "Waiting for payment.",
        paying: "Payment being checked…",
        declined: "Payment declined. The payer can try again.",
        checking: "Connection problem, checking…",
        paidTitle: "Paid",
        paidDescription: "The payment is confirmed.",
        expiredTitle: "Order expired",
        expiredDescription: "Nothing was paid.",
        acknowledge: "I acknowledge",
      },
      payments: {
        title: "This till's payments",
        loading: "Loading the payments…",
        refresh: "Refresh",
        refreshing: "Refreshing…",
        refreshFailed: "Couldn't refresh. These are the payments from before.",
        errorTitle: "The payments couldn't be loaded",
        errorDescription: "Check the connection and try again.",
        retry: "Try again",
        retrying: "Trying again…",
        emptyTitle: "No payments yet",
        emptyDescription: "Orders paid at this till show up here.",
        loadMore: "Load more",
        loadingMore: "Loading more…",
        loadMoreFailed: "More payments couldn't be loaded.",
        time: "Time",
        orderCode: "Order code",
        payer: "Payer",
        items: "Items",
        amount: "Amount",
        refunded: "Refunded",
        status: "Status",
        item: "{{quantity}}× {{name}}",
        refundPending: "{{amount}} pending",
      },
    },
    // At the till's root, not under the tab: the payment's detail will show
    // the same badge.
    paymentStatus: {
      pending: "Being checked",
      confirmed: "Paid",
      declined: "Declined",
    },
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export type Resources = typeof en;

export default en;
