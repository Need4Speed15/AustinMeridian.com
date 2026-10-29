// Optional authoring helper; generated assets are committed, so builds need no dependencies.
// Requires FFmpeg with libwebp and Python with fontTools + Brotli.
// Pass --python and --ffmpeg to select explicit installed tool paths if needed.
// Local-only fontTools packages may be installed under .local/asset-tools; never deployed.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { stat } from 'node:fs/promises';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const ffmpeg = option('--ffmpeg', 'ffmpeg');
const python = option('--python', 'python');
const assets = resolve(root, 'public/assets');
function run(program, command) {
  const result = spawnSync(program, command, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(`${program} failed: ${result.stderr || result.error?.message || 'unknown error'}`);
}
const images = [
  ['austin-meridian-gold-transparent.png', 'austin-meridian-hero.webp', 1080, 90],
  ['austin-meridian-gold-transparent.png', 'austin-meridian-footer.webp', 320, 90],
  ['austin-meridian-symbol.png', 'austin-meridian-symbol-160.webp', 160, 92],
  ['fitquest-logo.png', 'fitquest-logo-480.webp', 480, 92],
  ['fitquest-horizon.jpg', 'fitquest-horizon.webp', 1536, 87]
];
for (const [input, output, width, quality] of images) {
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', resolve(assets, input), '-vf', `scale=${width}:-1:flags=lanczos`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', resolve(assets, output)]);
}
// Preserve Latin/Latin Extended glyphs, punctuation, arrows and all layout features.
// Existing full TTF originals and OFL license remain available as source material.
const subset = `import sys
sys.path.insert(0, sys.argv[1])
from fontTools import subset
subset.main(sys.argv[2:])`;
for (const style of ['Regular', 'Italic']) {
  run(python, ['-c', subset, resolve(root, '.local/asset-tools'), resolve(assets, `EBGaramond-${style}.ttf`), '--unicodes=U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2190-21FF', '--layout-features=*', '--flavor=woff2', `--output-file=${resolve(assets, `EBGaramond-${style}-latin.woff2`)}`]);
}
for (const output of [...images.map(item => item[1]), 'EBGaramond-Regular-latin.woff2', 'EBGaramond-Italic-latin.woff2']) {
  console.log(`${output}: ${(await stat(resolve(assets, output))).size} bytes`);
}
