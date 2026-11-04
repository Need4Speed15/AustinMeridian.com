# Website assets

Public website assets are stored in `public/assets/` and copied into the generated site.

## Branding and artwork

Austin Meridian, FitQuest and Flight Review Companion retain distinct visual identities. Preserve logo proportions. Concept artwork and demonstration screenshots must retain accurate captions; do not present illustrative artwork as a product screenshot.

The screenshot captions and disclosures identify the relevant product version, demonstration data and capture limitations. Preserve fictional/training-only notices, source citations and educational limitations in Flight Review Companion captures. Full-size links provide access to the original screenshot files.

Detailed asset provenance, permission records and original production notes are maintained separately from public source. No claim of exclusive intellectual-property ownership or third-party endorsement is made here.

## Fonts

The site bundles EB Garamond regular and italic, including WOFF2 subsets and the original TTF files. These are covered by the [included SIL Open Font License 1.1](../public/assets/OFL-EBGaramond.txt). Preserve that copyright notice and license when distributing the fonts, and follow its conditions for modifications and reuse.

The sans-serif stack names Inter, Segoe UI, Arial and a generic sans-serif fallback. Inter is not bundled or downloaded by the website; local availability determines the selected fallback.

## Maintenance

An optional authoring helper, `scripts/optimize-assets.mjs`, prepares WebP images and WOFF2 subsets from the existing source assets. Published builds use committed assets and do not need those authoring tools.

## Deadway

Deadway uses its supplied ticket logo and actual development captures with visible milestone captions. Images are optimized for web delivery; no scene content is added. Preserve the full logo and development labels.

The dedicated page serves Oswald under its included SIL Open Font License and Roboto Slab under its included Apache License 2.0. Both font files and their notices are in `public/assets/deadway/`.

## Beet Farmer

Beet Farmer uses its supplied Cozy Wordmark and beet icon. Preserve the logo’s proportions, colors, and full lettering. Development captures retain visible labels for scripted cameras, staged inventory, and the relevant milestone. No scene content is added.

The dedicated page serves Fraunces and Bricolage Grotesque under their included SIL Open Font License notices in `public/assets/beet-farmer/`. Keep both notices with the fonts.

## Company introduction

The homepage uses the supplied four-second H.264/AAC company introduction, prepared for progressive MP4 playback with the original audio retained. No video is loaded on project or resource pages. The intro requests audible playback, with a play-button fallback when the browser requires a user gesture.

