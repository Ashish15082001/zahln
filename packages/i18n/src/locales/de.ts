import type { Resources } from "./en";

// Typed against the English resources, so a key added in English and missing
// here fails the typecheck instead of silently falling back on a German phone.
const de: Resources = {
  common: {
    continue: "Weiter",
    version: "Version {{version}}",
  },
  student: {
    appName: "Zahln",
    welcome: {
      title: "Willkommen bei Zahln",
      description: "Bezahlen Sie Ihr Mensaessen mit dem Handy.",
    },
    login: {
      title: "Anmelden",
      description:
        "Melden Sie sich mit Ihrem Konto für Studierende, Bedienstete oder Gäste an.",
      username: "Benutzername",
      password: "Passwort",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      errors: {
        wrongPassword: "Benutzername oder Passwort ist falsch.",
        notPayer: "Mit diesem Konto kann die Zahln-App nicht benutzt werden.",
        unreachable: "Der Server ist nicht erreichbar. Bitte erneut versuchen.",
        badCandidate: "Dieser Build hat eine falsche Candidate-ID.",
        unknown: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
      },
    },
    home: {
      greeting: "Hallo, {{name}}",
      logOut: "Abmelden",
      payments: {
        title: "Ihre Zahlungen",
        loading: "Ihre Zahlungen werden geladen…",
        refresh: "Aktualisieren",
        refreshing: "Wird aktualisiert…",
        refreshFailed:
          "Aktualisieren fehlgeschlagen. Das sind Ihre Zahlungen von vorher.",
        errorTitle: "Ihre Zahlungen konnten nicht geladen werden",
        errorDescription:
          "Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        retry: "Erneut versuchen",
        retrying: "Wird erneut versucht…",
        emptyTitle: "Noch keine Zahlungen",
        emptyDescription:
          "Mahlzeiten, die Sie mit Zahln bezahlen, erscheinen hier.",
        loadMore: "Mehr laden",
        loadingMore: "Wird geladen…",
        loadMoreFailed: "Weitere Zahlungen konnten nicht geladen werden.",
        item: "{{quantity}}× {{name}}",
        refunded: "{{amount}} erstattet",
        refundPending: "Erstattung von {{amount}} in Bearbeitung",
      },
      scan: {
        button: "QR scannen",
        installing: "Scanner wird vorbereitet…",
        notAnOrderTitle: "Kein Zahln-Code",
        notAnOrderDescription:
          "Mit diesem QR-Code kann nicht in der Mensa bezahlt werden. Scannen Sie den Code auf dem Bildschirm der Kasse.",
        scanAgain: "Erneut scannen",
        close: "Schließen",
      },
    },
    scan: {
      title: "QR scannen",
      cancel: "Abbrechen",
      back: "Zurück",
      starting: "Kamera wird gestartet…",
      hint: "Richten Sie die Kamera auf den QR-Code auf dem Bildschirm der Kasse.",
      notAnOrder:
        "Das ist kein Zahln-Code. Richten Sie die Kamera auf den QR-Code der Kasse.",
      cameraDeniedTitle: "Kamerazugriff ist aus",
      cameraDeniedDescription:
        "Erlauben Sie die Kamera in den Einstellungen und versuchen Sie es erneut. Oder geben Sie den Code unter dem QR-Code der Kasse ein.",
      openSettings: "Einstellungen öffnen",
      tryAgain: "Erneut versuchen",
      unavailableTitle: "Dieses Gerät kann nicht scannen",
      unavailableDescription:
        "Geben Sie den Code ein, der unter dem QR-Code auf dem Bildschirm der Kasse steht.",
      codeLabel: "Bestellcode",
      codeHint: "Er steht unter dem QR-Code auf dem Bildschirm der Kasse.",
      codeInvalid:
        "Das ist kein Bestellcode. Bitte prüfen und erneut versuchen.",
      openOrder: "Bestellung öffnen",
    },
    order: {
      title: "Bestellung",
      back: "Zurück",
      loading: "Die Bestellung wird geladen…",
      notFoundTitle: "Bestellung nicht gefunden",
      notFoundDescription:
        "Prüfen Sie den Code, oder scannen Sie den QR-Code auf dem Bildschirm der Kasse erneut.",
      errorTitle: "Die Bestellung konnte nicht geladen werden",
      errorDescription:
        "Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      retry: "Erneut versuchen",
      retrying: "Wird erneut versucht…",
      priceGroup: {
        student: "Preis für Studierende",
        staff: "Preis für Bedienstete",
        guest: "Preis für Gäste",
      },
      payWithin: "Bezahlen innerhalb von {{time}}",
      timeUp: "Die Zeit ist abgelaufen. Die Bestellung wird geprüft…",
      items: "Artikel",
      unitPrice: "{{quantity}} × {{unitPrice}}",
      total: "Summe",
      payingTitle: "Zahlung wird geprüft",
      payingYoursDescription: "Ihre Zahlung für diese Bestellung wird geprüft.",
      payingDescription: "Eine Zahlung für diese Bestellung wird geprüft.",
      paidTitle: "Bereits bezahlt",
      paidYoursDescription: "Sie haben diese Bestellung bezahlt.",
      paidDescription: "Diese Bestellung wurde bereits bezahlt.",
      expiredTitle: "Bestellung abgelaufen",
      expiredDescription:
        "Es wurde nichts bezahlt. Bitten Sie an der Kasse um eine neue Bestellung.",
      seePayment: "Zur Zahlung",
    },
    pay: {
      title: "Bezahlen",
      back: "Zurück",
      done: "Fertig",
      pay: "{{amount}} bezahlen",
      payNoAmount: "Bezahlen",
      paying: "Wird bezahlt…",
      checkAgain: "Erneut prüfen",
      ownPayment: {
        pendingTitle: "Zahlung wird geprüft",
        pendingDescription: "Ihre Zahlung für diese Bestellung wird geprüft.",
        confirmedTitle: "Bezahlt",
        confirmedDescription: "Sie haben diese Bestellung bezahlt.",
        longPendingTitle: "Wird noch geprüft",
        longPendingDescription:
          "Das kann ein paar Minuten dauern. Das Ergebnis finden Sie bei Ihren Zahlungen.",
        refresh: "Aktualisieren",
        refreshing: "Wird aktualisiert…",
      },
      messages: {
        declined: {
          title: "Zahlung abgelehnt",
          description: "Es wurde nichts bezahlt. Sie können erneut bezahlen.",
        },
        unconfirmed: {
          title: "Zahlung nicht bestätigt",
          description:
            "Sie ist vielleicht durchgegangen. Erneut prüfen klärt das und bezahlt nie doppelt.",
        },
        priceChanged: {
          title: "Der Preis hat sich geändert",
          description: "Prüfen Sie den neuen Betrag und bezahlen Sie dann.",
        },
        orderExpired: {
          title: "Bestellung abgelaufen",
          description:
            "Es wurde nichts bezahlt. Bitten Sie an der Kasse um eine neue Bestellung.",
        },
        orderPaid: {
          title: "Bereits bezahlt",
          description: "Diese Bestellung wurde bereits bezahlt.",
        },
        orderPaying: {
          title: "Zahlung wird geprüft",
          description: "Eine Zahlung für diese Bestellung wird geprüft.",
        },
        orderNotFound: {
          title: "Bestellung nicht gefunden",
          description:
            "Scannen Sie den QR-Code auf dem Bildschirm der Kasse erneut.",
        },
        updateRequired: {
          title: "App aktualisieren",
          description:
            "Mit dieser Version können Sie nicht mehr bezahlen. Aktualisieren Sie Zahln und bezahlen Sie dann.",
        },
        paymentsPaused: {
          title: "Zahlungen sind pausiert",
          description: "Versuchen Sie es in ein paar Minuten erneut.",
        },
        failed: {
          title: "Die Zahlung hat nicht geklappt",
          description: "Versuchen Sie es erneut.",
        },
      },
    },
    paymentStatus: {
      pending: "Wird geprüft",
      confirmed: "Bezahlt",
      declined: "Abgelehnt",
    },
    refundStatus: {
      pending: "In Bearbeitung",
      completed: "Erstattet",
      failed: "Fehlgeschlagen",
    },
    paymentDetail: {
      title: "Zahlung",
      back: "Zurück",
      refresh: "Aktualisieren",
      refreshing: "Wird aktualisiert…",
      refreshFailed:
        "Aktualisieren fehlgeschlagen. Das ist die Zahlung von vorher.",
      loading: "Die Zahlung wird geladen…",
      loadingMore: "Erstattungen und Verlauf werden geladen…",
      notFoundTitle: "Zahlung nicht gefunden",
      notFoundDescription:
        "Es gibt sie nicht, oder sie gehört zu einem anderen Konto.",
      errorTitle: "Die Zahlung konnte nicht geladen werden",
      errorDescription:
        "Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      retry: "Erneut versuchen",
      retrying: "Wird erneut versucht…",
      items: "Artikel",
      unitPrice: "{{quantity}} × {{unitPrice}}",
      total: "Summe",
      refunded: "{{amount}} erstattet",
      refundPending: "Erstattung von {{amount}} in Bearbeitung",
      refunds: "Erstattungen",
      refundReason: "Grund: {{reason}}",
      history: "Verlauf",
      events: {
        payment_created: "Zahlung gestartet",
        payment_confirmed: "Zahlung bestätigt",
        payment_declined: "Zahlung abgelehnt",
        refund_requested: "Erstattung angefordert",
        refund_completed: "Erstattung abgeschlossen",
        refund_failed: "Erstattung fehlgeschlagen",
        other: "Sonstige Änderung",
      },
      paymentId: "Zahlungs-ID: {{paymentId}}",
    },
  },
  till: {
    appName: "Zahln Kasse",
    welcome: {
      title: "Willkommen bei Zahln",
      description: "Bestellungen erfassen und Zahlungen in der Mensa annehmen.",
    },
    login: {
      title: "Anmelden",
      description: "Melden Sie sich mit Ihrem Kassenkonto an.",
      username: "Benutzername",
      password: "Passwort",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      errors: {
        wrongPassword: "Benutzername oder Passwort ist falsch.",
        notCashier: "Mit diesem Konto kann die Kasse nicht benutzt werden.",
        unreachable: "Der Server ist nicht erreichbar. Bitte erneut versuchen.",
        badCandidate: "Dieser Build hat eine falsche Candidate-ID.",
        unknown: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
      },
    },
    home: {
      greeting: "Hallo, {{name}}",
      logOut: "Abmelden",
      tabs: {
        mensa: "Mensa",
        payments: "Zahlungen",
      },
      mensa: {
        loading: "Speiseplan wird geladen…",
        error: "Der Speiseplan konnte nicht geladen werden.",
        retry: "Erneut versuchen",
        retrying: "Wird erneut versucht…",
        notFound: "Ihre Mensa steht nicht in der Liste des Servers.",
        emptyMenu: "Keine Gerichte auf dem Speiseplan.",
        dish: "Gericht",
        student: "Studierende",
        staff: "Bedienstete",
        guest: "Gäste",
        selectAll: "Alle Gerichte auswählen",
        selectDish: "{{dish}} auswählen",
        quantity: "Menge",
        // "Ein … mehr" would have to agree with each dish's gender, so the
        // German names the action instead.
        oneMore: "Menge von {{dish}} erhöhen",
        oneFewer: "Menge von {{dish}} verringern",
        createOrder: "Bestellung anlegen",
      },
      order: {
        creatingTitle: "Bestellung wird angelegt…",
        creatingDescription: "Das dauert einen Moment.",
        unconfirmedTitle: "Bestellung nicht bestätigt",
        unconfirmedDescription:
          "Sie wurde vielleicht angelegt. Erneut versuchen prüft das und legt sie nie doppelt an.",
        failedTitle: "Bestellung nicht angelegt",
        failedDescription:
          "Es wurde nichts angelegt. Sie können es erneut versuchen.",
        tryAgain: "Erneut versuchen",
        cancel: "Abbrechen",
        scanToPay: "Zum Bezahlen scannen",
        qrLabel: "QR-Code zum Bezahlen dieser Bestellung",
        orderCode: "Code: {{orderId}}",
        waiting: "Warten auf Zahlung.",
        paying: "Zahlung wird geprüft…",
        declined: "Zahlung abgelehnt. Die Person kann es erneut versuchen.",
        checking: "Verbindungsproblem, wird geprüft…",
        paidTitle: "Bezahlt",
        paidDescription: "Die Zahlung ist bestätigt.",
        expiredTitle: "Bestellung abgelaufen",
        expiredDescription: "Es wurde nichts bezahlt.",
        acknowledge: "Zur Kenntnis genommen",
      },
      payments: {
        title: "Zahlungen dieser Kasse",
        loading: "Zahlungen werden geladen…",
        refresh: "Aktualisieren",
        refreshing: "Wird aktualisiert…",
        refreshFailed:
          "Aktualisieren fehlgeschlagen. Das sind die Zahlungen von vorher.",
        errorTitle: "Die Zahlungen konnten nicht geladen werden",
        errorDescription:
          "Prüfen Sie die Verbindung und versuchen Sie es erneut.",
        retry: "Erneut versuchen",
        retrying: "Wird erneut versucht…",
        emptyTitle: "Noch keine Zahlungen",
        emptyDescription:
          "Bestellungen, die an dieser Kasse bezahlt werden, erscheinen hier.",
        loadMore: "Mehr laden",
        loadingMore: "Wird geladen…",
        loadMoreFailed: "Weitere Zahlungen konnten nicht geladen werden.",
        time: "Zeit",
        orderCode: "Bestellcode",
        payer: "Zahlende Person",
        items: "Gerichte",
        amount: "Betrag",
        refunded: "Erstattet",
        status: "Status",
        item: "{{quantity}}× {{name}}",
        refundPending: "{{amount}} in Bearbeitung",
      },
    },
    paymentStatus: {
      pending: "Wird geprüft",
      confirmed: "Bezahlt",
      declined: "Abgelehnt",
    },
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export default de;
