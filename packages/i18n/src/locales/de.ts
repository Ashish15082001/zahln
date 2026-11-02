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
        "Wählen Sie einen Testnutzer. Dieselbe Bestellung kostet für jeden einen anderen Betrag.",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      testUsers: {
        student: {
          title: "Studierende",
          description: "Zahlt Preise für Studierende.",
        },
        staff: {
          title: "Bedienstete",
          description: "Zahlt Preise für Bedienstete.",
        },
        guest: { title: "Gäste", description: "Zahlt Preise für Gäste." },
      },
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
      profile: "Profil",
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
      checkingPayer: "Wird bestätigt…",
      payerCheckTitle: "{{amount}} bezahlen",
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
        payerLockedOut: {
          title: "Zu viele Versuche",
          description:
            "Es wurde nichts bezahlt. Warten Sie kurz oder nutzen Sie die PIN Ihres Telefons und bezahlen Sie dann erneut.",
        },
        payerCheckFailed: {
          title: "Bestätigung nicht möglich",
          description: "Es wurde nichts bezahlt. Versuchen Sie es erneut.",
        },
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
    profile: {
      title: "Profil",
      back: "Zurück",
      priceGroup: {
        student: "Preise für Studierende",
        staff: "Preise für Bedienstete",
        guest: "Preise für Gäste",
      },
      theme: {
        title: "App-Design",
        description: "Hell oder dunkel",
        system: "Wie das Handy",
        light: "Hell",
        dark: "Dunkel",
      },
      language: {
        title: "App-Sprache",
        description: "Englisch oder Deutsch",
        device: "Wie das Handy",
        en: "English",
        de: "Deutsch",
      },
      logOut: {
        title: "Abmelden",
        description: "Beendet die Sitzung auf diesem Handy",
      },
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
    login: {
      title: "Anmelden",
      description:
        "Melden Sie sich mit dem Finanzkonto des Studierendenwerks an.",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      financeUser: {
        title: "Finanzen",
        description: "Sieht alle Zahlungen und die Tagessummen jeder Mensa.",
      },
      errors: {
        wrongPassword: "Benutzername oder Passwort ist falsch.",
        notFinanceUser:
          "Mit diesem Konto kann das Dashboard nicht benutzt werden.",
        unreachable: "Der Server ist nicht erreichbar. Bitte erneut versuchen.",
        badCandidate: "Dieser Build hat eine falsche Candidate-ID.",
        unknown: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
      },
    },
    header: {
      nav: {
        label: "Bereiche",
        dailyTotals: "Tagessummen",
        payments: "Zahlungen",
      },
      logOut: "Abmelden",
    },
    screenTitleRow: {
      refresh: "Aktualisieren",
      refreshing: "Wird aktualisiert…",
    },
    dailyTotals: {
      title: "Tagessummen",
      description:
        "Tage nach Berliner Zeit. Zahlungen zählen am Tag, an dem sie gemacht wurden, Erstattungen am Tag, an dem sie abgeschlossen wurden.",
      updated: "Stand",
      refreshFailed:
        "Aktualisieren fehlgeschlagen. Das sind die Summen von vorher.",
      loading: "Summen werden geladen…",
      errorTitle: "Die Summen konnten nicht geladen werden",
      errorDescription:
        "Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      retry: "Erneut versuchen",
      retrying: "Wird erneut versucht…",
      dayPicker: {
        label: "Tag",
        previous: "Vorheriger Tag",
        next: "Nächster Tag",
      },
      tiles: {
        gross: "Brutto",
        grossNote: "Bestätigte Zahlungen",
        refunded: "Erstattet",
        refundedNote: "An diesem Tag abgeschlossene Erstattungen",
        net: "Netto",
        netNote: "Brutto minus Erstattungen",
        payments: "Zahlungen",
        paymentsNote: "An diesem Tag bestätigt",
        pending: "In Prüfung",
        pendingNote: "{{count}} in Prüfung, nicht im Brutto",
      },
      table: {
        title: "Nach Mensa und Kasse",
        name: "Mensa und Kasse",
        payments: "Zahlungen",
        gross: "Brutto",
        refunded: "Erstattet",
        net: "Netto",
        pending: "In Prüfung",
      },
    },
    paymentStatus: {
      pending: "In Prüfung",
      confirmed: "Bestätigt",
      declined: "Abgelehnt",
    },
    payments: {
      title: "Zahlungen",
      description:
        "Alle Zahlungen jeder Mensa, die neuesten zuerst. Tage und Uhrzeiten nach Berliner Zeit.",
      filters: {
        search: "Zahlungs-, Bestell- oder Zahler-ID",
        searchPlaceholder: "Anfang einer ID, z. B. pay_6f85",
        searchSubmit: "Suchen",
        mensa: "Mensa",
        allMensas: "Alle Mensen",
        till: "Kasse",
        allTills: "Alle Kassen",
        tillOfMensa: "{{mensa}} · {{till}}",
        status: "Status",
        allStatuses: "Alle Status",
        days: "Tage",
        anyDay: "Jeder Tag",
        dayRange: "{{from}} – {{to}}",
        clearDays: "Zurücksetzen",
        applyDays: "Übernehmen",
        clear: "Filter zurücksetzen",
      },
      table: {
        created: "Erstellt",
        status: "Status",
        amount: "Betrag",
        refunded: "Erstattet",
        refundPending: "{{amount}} unterwegs",
        place: "Mensa und Kasse",
        payer: "Zahler",
        payment: "Zahlung und Bestellung",
      },
      loading: "Zahlungen werden geladen…",
      errorTitle: "Die Zahlungen konnten nicht geladen werden",
      errorDescription:
        "Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      retry: "Erneut versuchen",
      retrying: "Wird erneut versucht…",
      emptyTitle: "Keine Zahlungen gefunden",
      emptyDescription: "Keine Zahlung passt zu diesen Filtern.",
      refreshFailed:
        "Aktualisieren fehlgeschlagen. Das sind die Zahlungen von vorher.",
      shownCount: "Angezeigt: {{count}}",
      loadMore: "Mehr laden",
      loadingMore: "Wird geladen…",
      loadMoreFailed: "Weitere Zahlungen konnten nicht geladen werden.",
    },
  },
};

export default de;
