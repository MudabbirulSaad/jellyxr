# Comparison fixtures

These assets and records are technical fixtures, not Jellyfin library content. They are reachable only through the opt-in XR experiment build. Do not present their results as server-delivery or headset qualification.

## Orientation video

`video-orientation.mp4` is an original generated calibration clip: H.264, 640 × 360, 24 fps, eight seconds, no audio or subtitle stream. Top-left and bottom-right labels expose mirrored or inverted mapping. It does not exercise HDR, audio synchronization, seeking, server conversion or subtitle composition.

Generated 2026-09-30 using FFmpeg 8.0.1 and the existing `@fontsource/noto-sans` 5.3.0 Latin regular font (SIL Open Font License 1.1, preserved in that package). No film, personal artwork or external video was imported. The generated fixture and its source recipe are distributed under this repository's GPL-2.0-or-later licence. FFmpeg is a local authoring tool, not a runtime dependency.

SHA-256: `1b4d4a68f1e0293b92f6b5ccba20e89bc758474ef70f56cf2c942430dc6c39c9`.

Run from the repository root. If the file already exists, FFmpeg asks before replacing it. Encoder builds may produce different bytes; record a new hash after regenerating.

```powershell
ffmpeg -hide_banner -f lavfi -i 'testsrc2=size=640x360:rate=24:duration=8' -vf "drawtext=fontfile=node_modules/@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff:text='JellyXR TECHNICAL FIXTURE - TOP LEFT':x=12:y=12:fontsize=22:fontcolor=white:box=1:boxcolor=black,drawtext=fontfile=node_modules/@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff:text='BOTTOM RIGHT - 640x360 - 24 fps':x=w-tw-12:y=h-th-12:fontsize=18:fontcolor=white:box=1:boxcolor=black" -c:v libx264 -pix_fmt yuv420p -crf 28 -movflags +faststart -an src/apps/experimental/xr/fixtures/video-orientation.mp4
```

Room geometry is authored in `roomFixture.ts`; catalogue records are generated in `catalogueFixture.ts`. Neither uses account or media data. The initial boxes are comparison geometry, not the finished Cinema Observatory models.
