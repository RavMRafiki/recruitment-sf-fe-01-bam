# Recruitment SF Frontend Task

This repository contains two standalone advertising concepts:

- `variant-a-game/` — a 360 × 640 portrait Phaser game.
- `variant-b-fireplace/` — a 320 × 975 / 1032 × 250 fireplace takeover preview built from three coordinated iframes.

## Run locally

Both variants include a committed `dist/` folder. Serve the relevant `dist/` folder with Python, VS Code Live Server, or any other static HTTP server:

```bash
cd variant-a-game
python3 -m http.server 8000 --directory dist
```

```bash
cd variant-b-fireplace
python3 -m http.server 8000 --directory dist
```

Open the file link printed by the server. The game is available at `/`; for the fireplace takeover, open `/preview.html`.

To regenerate the committed distribution folders after changing source files:

```bash
cd variant-a-game
npm install && npm run build
```

```bash
cd variant-b-fireplace
npm install && npm run build
```

The two servers must use different ports if you want to view both variants at the same time.

## What I would do next

- Improve the hitboxes so they match the visible parts of the obstacle artwork more precisely.
- Adjust the random obstacle spawning to be more challenging, especially by spawning obstacles on opposite sides one after another more frequently.
- Research more webpage campaign banners to better understand which formats and treatments attract attention and produce click-throughs.

## Known issues and shortcuts

- Both variants use the supplied raster artwork directly; there is no runtime asset pipeline beyond Vite’s static copying.
- The fireplace preview uses fixed 320 × 975 and 1032 × 250 panels, so the local preview is a layout proof rather than a fully responsive publisher mock.
- Fireplace clicks currently fall back to `https://example.com/` unless a `clickTag` query parameter or `window.clickTag` is provided.
- When allow-popups is not added to iframe containing the game the opening will fallback to opening the `clickTag` link in the current window. (This happens when using Safari on IPhone)
- Audio is implemented in the game and depends on browser user-gesture/autoplay rules; the mute control is available after loading.
- Collision shapes in the game are hand-authored approximations and do not always match the exact visible size of each obstacle.
- The fireplace preview's debug overlay for checking the design layout was not tested across different screen sizes and works fully only in a full-screen view.
- The game was only tested on one Android phone using Chrome and one iPhone using Safari.

## AI note

I used GitHub Copilot with automatic model selection for most parts of the development, and checked whether its output matched what I would have created myself. Automatic model selection helped reduce token usage. The biggest problem was adjusting hitboxes: Copilot could not consistently fit them to the exact visible part of each image, so I adjusted most of them by hand. For a larger number of images, I would develop a small hitbox-generation script with AI assistance.

See [DECISIONS.md](./DECISIONS.md) for the short implementation decision log.
 
