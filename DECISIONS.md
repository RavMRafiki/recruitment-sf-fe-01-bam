# Decision log

- **Canvas vs DOM:** The game uses Phaser and a canvas because its player motion, timed obstacle sequence, tweens, and collision checks are stateful and easier to coordinate in one scene. The fireplace remains DOM/CSS because it is primarily layered artwork and timed animation.
- **Viewport scaling:** The game keeps a 9:16 logical stage and constrains the `#ad` element to the available viewport while stretching the Phaser canvas to that element. This preserves the portrait composition on both narrow and tall screens.
- **Game collision:** Obstacles use small, hand-authored circle and rectangle definitions instead of image-pixel collision. This keeps collision predictable and avoids making transparent artwork part of the playable boundary, although the current approximations could be refined further.
- **Obstacle difficulty:** The current obstacle sequence favors predictable authored gameplay. A next iteration would make opposite-side spawns occur more frequently to increase challenge without making individual obstacles unfair.
- **Fireplace alignment:** Each fireplace panel uses the supplied 1680 × 975 background at fixed pixel offsets. The preview places the 320 px side panels and 1032 px top panel in a matching grid, which keeps the background continuous across the takeover.
- **Cross-frame control:** The preview coordinates the three iframe animations with `postMessage`, including a replay action, rather than coupling the frames through shared scripts.
- **Audio:** Game audio is loaded as separate loop, crash, fail, win, and applause tracks so events can be controlled independently. A visible mute button handles browser-friendly user control.
- **Asset handling:** Existing WebP artwork is reused directly; source PNG/JPG artwork was converted once offline and the resulting files are served statically. There is no runtime asset pipeline.

## File Compression
- **Vite built-in features:** Automatic minification and tree-shaking reduce the JavaScript and CSS payloads, but the final size is dominated by audio and visual assets.
- **PNG/JPG to WebP conversion:** Raster artwork was exported offline to WebP at the supplied dimensions and then served as static files. Variant A artwork decreased from 0,6 MB to 0,3 MB, saving 50%. Variant B artwork decreased from 3,6 MB to 2,6 MB, saving 28%. The later restoration of `box.png` reduces that converted source payload by a further 0,02 MB because its filter did not work correctly with WebP.
- **Bitrate downsampling:** Variant A’s five MP3 files were re-encoded to 96 kbps. Their total decreased from 1,3MB to 0.9MB, saving 31%. Variant B has no audio assets and therefore no bitrate reduction.

The committed final `dist/` payloads are Variant A, 2,64 MB Variant B, 1,85 MB.