# Desktop Pet Asset Repair Playbook

This note captures the repair process used on the current DeskPet avatar assets. Reuse it for every new GIF, animated WebP, or spritesheet before adding the asset to the runtime pet pack.

## Goal

Fix problems at the asset level instead of hiding them in app playback code.

The repaired asset should feel calm, stable, and clean when floating on a real desktop. For idle animations, the pet should have a quiet companion feeling: slow breathing, occasional blink, no whole-body wobble, and no dirty edge halo.

## Common Problems

Check each asset for these issues:

- Speed: the loop feels too fast, nervous, or busy.
- Blink frequency: the character blinks too often, such as multiple times per second.
- Jitter: the whole character shifts position between frames.
- Edge halo: white, gray, or dirty pixels appear around the character on dark backgrounds.
- Loop snap: the last frame jumps awkwardly back to the first frame.
- Scale drift: the character changes size between related states.
- Anchor drift: the feet or bottom contact point move when the action should be stationary.

## Recommended Folder Layout

Keep each repair stage separate so the original source stays recoverable.

```text
asset_name/
  source/
  frames_raw/
  frames_aligned/
  frames_cleaned/
  qa/
  export/
```

## Repair Pipeline

1. Preserve the original asset under `source/`.
2. Split the GIF, animated WebP, or spritesheet into individual transparent PNG frames.
3. Normalize every frame to the same canvas size.
4. Choose a stable anchor point.
5. Align all frames to that anchor.
6. Clean transparent edges and remove matte pixels.
7. Tune frame durations, not just global FPS.
8. Rebuild the GIF, animated WebP, or spritesheet.
9. Preview on white, dark, and real desktop backgrounds.
10. Compare the result against the target reference rhythm.

## Anchor Rules

Pick one anchor and keep it stable across the animation.

Recommended anchors:

- `idle`: bottom center or foot center.
- `sleep`: bottom body edge.
- `walk`: foot contact point or consistent ground line.
- `jump`: shadow center or landing position.
- `touch`: bottom center, unless the touch action intentionally moves the pet.

Important rule: facial expression, hair, clothing, arms, and breathing can move. The whole character should not drift unless the action is intentionally moving.

For the current avatar, idle repair should prioritize stable feet and stable body center. Eye and face frames may change, but the character should not bounce around the canvas.

## Timing Rules

Do not fix timing only by changing playback FPS in the app. Store the intended rhythm in the exported asset.

For idle:

- Hold normal idle frames longer.
- Keep blink frames short.
- Avoid blinking every loop.
- Add still frames between expressive motions.
- Make the loop feel closer to a calm desktop companion than a sticker animation.

Useful starting points:

```text
idle normal hold: 300-800 ms
blink frame: 60-120 ms
idle loop length: 3-6 seconds
walk frame: 100-160 ms
active reaction frame: 80-160 ms
sleep frame: 500-1200 ms
```

These are starting values. Tune by looking at the pet at real desktop size.

## Edge Cleanup

Desktop pets float over arbitrary wallpapers, so edge quality matters more than it does in a normal chat sticker.

QA each frame on:

- white background
- dark gray or black background
- transparent background over a real desktop wallpaper

Fixes to apply:

- Remove white matte pixels around the outline.
- Repair semi-transparent dirty pixels.
- Preserve a clean outline.
- For pixel or chibi assets, avoid fuzzy AI edges.
- If needed, redraw a simple 1 px outline by hand in Aseprite.

Animated WebP usually preserves alpha better than GIF. If GIF introduces obvious haloing, prefer animated WebP for runtime assets when the app supports it.

## Export Targets

When possible, export both runtime and editing formats.

```text
idle.webp
idle.gif
idle_spritesheet.png
idle.json
```

Example metadata:

```json
{
  "name": "idle",
  "frameWidth": 256,
  "frameHeight": 256,
  "anchor": "bottom-center",
  "durations": [500, 500, 500, 80, 80, 900],
  "notes": "Stable feet, one blink cluster, no whole-body jitter."
}
```

## QA Checklist

Before accepting an asset, verify:

- The pet is readable at actual desktop size.
- The anchor stays stable.
- The loop does not snap.
- Idle does not blink too often.
- There is no visible halo on dark backgrounds.
- The character does not jitter unless the action requires movement.
- Related states use consistent scale and canvas placement.
- The emotion or action is clear without text.
- The asset still looks like the locked character design.

## Automation vs Manual Work

Use scripts for:

- splitting animations into frames
- measuring bounding boxes
- aligning frames to an anchor
- extending frame durations
- exporting GIF, WebP, and spritesheets
- generating QA contact sheets

Use Aseprite or manual frame editing for:

- cleaning important outlines
- fixing eyes, face, hands, and hair
- preserving personality cues
- removing AI artifacts
- making the animation feel intentional

The practical workflow is:

```text
generate asset
split frames
align anchor
clean edges
tune timing
manual Aseprite polish
export
preview in app
```

## Lessons From The Current Avatar

The first generated idle asset had three visible problems:

- The blink rhythm was too fast.
- The body position drifted between frames.
- The outline had visible dirty edges on contrasting backgrounds.

The effective fix was to repair the source animation frames directly:

- keep the body and feet anchored
- reduce idle motion
- slow the loop
- make blinking occasional
- clean alpha edges
- repack the runtime asset

This should be the default standard for all future states: `idle`, `walk`, `sleep`, `eat`, `drink`, `focus`, `touch`, `missYou`, and `cuddle`.
