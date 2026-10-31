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
        orders: "Bestellungen",
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
      orders: {
        comingSoon: "Hier erscheinen die Bestellungen.",
      },
    },
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export default de;
