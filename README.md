# Salvatore Giacalone — Website

Prima bozza frontend statica del portfolio musicale di Salvatore Giacalone.

## Avvio locale

Non servono server, database o dipendenze: è sufficiente aprire `index.html` nel browser. In alternativa, dalla cartella del progetto:

```bash
npx serve .
```

## Dove inserire le foto

1. Crea una cartella `assets/images`.
2. Inserisci le immagini, ad esempio `salvatore-hero.jpg`.
3. In `index.html`, sostituisci il blocco `.image-placeholder` con:

```html
<img src="assets/images/salvatore-hero.jpg" alt="Salvatore Giacalone al pianoforte" />
```

4. Aggiungi in `styles.css` `width:100%; height:100%; object-fit:cover;` per l'immagine.

I link social presenti sono segnaposto: sostituiscili con i tuoi URL reali in `index.html`.

## Modulo contatti e Google Cloud

Il pulsante `Invia richiesta` invia i dati all'endpoint `/api/contact`. Il backend in `functions/` salva ogni richiesta nella collection Firestore `contactRequests` e invia una email tramite Gmail API.

Per attivarlo servono:

1. Un progetto Google Cloud/Firebase con fatturazione attiva.
2. Firestore in modalita Native.
3. Gmail API abilitata in Google Cloud Console.
4. Una configurazione OAuth 2.0 per l'account Gmail che deve spedire le email, con scope `https://www.googleapis.com/auth/gmail.send`.
5. Client ID, Client Secret e Refresh Token OAuth. Il refresh token va generato autorizzando l'account `salvatoregiacalone04@gmail.com`.
6. Firebase CLI installata e accesso al progetto con `firebase login`.

I segreti non devono essere inseriti nel codice. Prima del deploy vanno configurati così:

```bash
firebase use ID_DEL_PROGETTO
firebase functions:secrets:set GMAIL_CLIENT_ID
firebase functions:secrets:set GMAIL_CLIENT_SECRET
firebase functions:secrets:set GMAIL_REFRESH_TOKEN
firebase functions:secrets:set GMAIL_SENDER
firebase functions:secrets:set CONTACT_RECIPIENT
firebase deploy --only functions,firestore,hosting
```

Se il sito resta pubblicato su GitHub Pages, dopo il deploy bisogna impostare `window.CONTACT_API_URL` in `index.html` con l'URL della Cloud Function. Se viene pubblicato su Firebase Hosting, il rewrite `/api/contact` gia configurato permette di usare direttamente il form.
