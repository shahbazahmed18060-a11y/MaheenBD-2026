# Maheen's Birthday - Blush & Bloom (Music Edition)

A five-page interactive, pastel birthday website with an **original** soft birthday-themed instrumental soundtrack.

## Open locally

All files are in **one flat folder**. Open `index.html` in a browser; keep the other files beside it. No libraries, installs, or external music links are required.

## Upload to GitHub Pages

1. Extract this ZIP. It does NOT contain an enclosing folder.
2. Create a GitHub repository and upload **all extracted files** to the repository root, including `index.html`, `style.css`, `site.js`, `favicon.svg`, and `birthday-bgm.mp3`.
3. Under repository **Settings > Pages**, select **Deploy from a branch** and select `main` / `/(root)`.
4. Open the URL GitHub Pages provides once the site has deployed.

## Music behavior

Music is **ON by default**: the site automatically requests playback of `birthday-bgm.mp3` on page load, loops it at a gentle volume, and remembers when a visitor turns it off. A visitor who leaves music enabled will have it requested on every page.

**Important:** iPhone Safari, Android Chrome, and other browsers commonly block sound that starts without a user gesture. If this happens, the header button shows **Tap for music**. The visitor can tap that button OR tap anywhere on the page to enable sound. Browser-level restrictions cannot be bypassed by HTML/JavaScript.

Music can briefly pause between pages because this is a simple multi-page website; the player restores its previous approximate playback position where the browser allows. The included track was composed specifically for this website, not copied from commercial music.

## Pages

- `index.html` - home, countdown, celebration
- `wishes.html` - interactive letters and local wish jar
- `cake.html` - candles and birthday cake
- `surprises.html` - gifts to unwrap
- `finale.html` - letter and downloadable birthday card

## Customization

- Birthday text: edit any `*.html` page
- Colors and layouts: edit `style.css`
- Interactions and music controls: edit `site.js`
- Replace soundtrack: replace `birthday-bgm.mp3` with another MP3 using the same filename (ensure you have rights to use it)

The site is responsive, offline-capable, and sends no personal information anywhere. Wishes are stored only in the browser that submitted them.
