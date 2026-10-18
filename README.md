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
