import fs from "fs";
import zlib from "zlib";
import path from "path";

// CRC32 implementation for PNG chunks
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);
  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generateTuddyPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawBytes = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.48 : width * 0.44;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawBytes[pos++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background color: Soft peach #FFB7B2 or cream
      let r = 255;
      let g = 183;
      let b = 178;
      let a = 255;

      if (!isMaskable && dist > radius) {
        // Transparent outside circular badge
        a = 0;
        r = 0;
        g = 0;
        b = 0;
      } else {
        // Radial gentle gradient
        const t = Math.min(1, dist / radius);
        r = Math.round(255 - t * 15);
        g = Math.round(183 - t * 25);
        b = Math.round(178 - t * 20);

        // Draw Bunny Head & Ears
        // Head center: (cx, cy + size * 0.08)
        const headCy = cy + size * 0.08;
        const headDist = Math.sqrt(dx * dx + (y - headCy) * (y - headCy));
        const headRadius = size * 0.24;

        // Left Ear
        const leftEarDx = x - (cx - size * 0.12);
        const leftEarDy = (y - (cy - size * 0.18)) * 0.55;
        const leftEarDist = Math.sqrt(leftEarDx * leftEarDx + leftEarDy * leftEarDy);

        // Right Ear
        const rightEarDx = x - (cx + size * 0.12);
        const rightEarDy = (y - (cy - size * 0.18)) * 0.55;
        const rightEarDist = Math.sqrt(rightEarDx * rightEarDx + rightEarDy * rightEarDy);

        const isEar = leftEarDist < size * 0.11 || rightEarDist < size * 0.11;
        const isHead = headDist < headRadius;

        if (isEar || isHead) {
          // White bunny fur
          r = 255;
          g = 255;
          b = 255;

          // Inner ear pink
          const innerLeft = Math.sqrt(leftEarDx * leftEarDx + Math.pow((y - (cy - size * 0.18)) * 0.6, 2));
          const innerRight = Math.sqrt(rightEarDx * rightEarDx + Math.pow((y - (cy - size * 0.18)) * 0.6, 2));
          if (innerLeft < size * 0.055 || innerRight < size * 0.055) {
            r = 255;
            g = 195;
            b = 205;
          }

          // Eyes: 2 dark dots
          const eyeY = headCy - size * 0.03;
          const leftEyeDist = Math.sqrt(Math.pow(x - (cx - size * 0.08), 2) + Math.pow(y - eyeY, 2));
          const rightEyeDist = Math.sqrt(Math.pow(x - (cx + size * 0.08), 2) + Math.pow(y - eyeY, 2));
          if (leftEyeDist < size * 0.028 || rightEyeDist < size * 0.028) {
            r = 60;
            g = 45;
            b = 40;
          }

          // Cheeks: pink blush
          const cheekY = headCy + size * 0.04;
          const leftCheek = Math.sqrt(Math.pow(x - (cx - size * 0.13), 2) + Math.pow(y - cheekY, 2));
          const rightCheek = Math.sqrt(Math.pow(x - (cx + size * 0.13), 2) + Math.pow(y - cheekY, 2));
          if (leftCheek < size * 0.038 || rightCheek < size * 0.038) {
            r = 255;
            g = 175;
            b = 180;
          }

          // Nose: small triangle/dot
          const noseDist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - (headCy + size * 0.02), 2));
          if (noseDist < size * 0.016) {
            r = 245;
            g = 135;
            b = 145;
          }
        }
      }

      rawBytes[pos++] = r;
      rawBytes[pos++] = g;
      rawBytes[pos++] = b;
      rawBytes[pos++] = a;
    }
  }

  // Construct PNG
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6: RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const compressed = zlib.deflateSync(rawBytes, { level: 9 });

  const chunks = [
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

// Generate PWA icons
const publicDir = path.resolve(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, "pwa-192x192.png"), generateTuddyPNG(192, false));
fs.writeFileSync(path.join(publicDir, "pwa-512x512.png"), generateTuddyPNG(512, false));
fs.writeFileSync(path.join(publicDir, "pwa-maskable-512x512.png"), generateTuddyPNG(512, true));
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), generateTuddyPNG(180, false));

console.log("Successfully generated all PWA PNG icons!");
