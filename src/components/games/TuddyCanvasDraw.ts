import { PetCustomization } from "../../types";

export interface TuddyDrawOptions {
  x: number;
  y: number;
  radius?: number;
  angle?: number;
  expression?: "normal" | "happy" | "flying" | "dizzy" | "focused" | "surprised";
  pet?: PetCustomization;
  flipX?: boolean;
  scale?: number;
}

const FUR_COLORS: Record<string, { main: string; shadow: string; stroke: string; innerEar: string; cheeks: string }> = {
  white: { main: "#FFFFFF", shadow: "#E2E8F0", stroke: "#CBD5E1", innerEar: "#FDA4AF", cheeks: "#FDA4AF" },
  cinnamon: { main: "#E8A87C", shadow: "#D79264", stroke: "#B87343", innerEar: "#FCE7D8", cheeks: "#FB7185" },
  lavender: { main: "#D8B4E2", shadow: "#C392D3", stroke: "#9D6CB3", innerEar: "#FCE7F3", cheeks: "#F472B6" },
  ash_gray: { main: "#CBD5E1", shadow: "#94A3B8", stroke: "#64748B", innerEar: "#F1F5F9", cheeks: "#FDA4AF" },
  mint: { main: "#A7F3D0", shadow: "#6EE7B7", stroke: "#10B981", innerEar: "#ECFDF5", cheeks: "#FB7185" },
  golden: { main: "#FDE68A", shadow: "#FCD34D", stroke: "#D97706", innerEar: "#FEF9C3", cheeks: "#FB7185" },
};

/**
 * Draws an adorable Tuddy the Bunny character on an HTML5 canvas context.
 */
export function drawTuddy(ctx: CanvasRenderingContext2D, options: TuddyDrawOptions) {
  const {
    x,
    y,
    radius = 24,
    angle = 0,
    expression = "normal",
    pet,
    flipX = false,
    scale = 1,
  } = options;

  const furKey = pet?.furColor || "white";
  const fur = FUR_COLORS[furKey] || FUR_COLORS.white;

  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);
  ctx.scale(scale, scale);
  ctx.rotate(angle);

  const r = radius;

  // 1. Shadow beneath Tuddy if standing/grounded
  ctx.beginPath();
  ctx.ellipse(0, r * 0.9, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fill();

  // 2. Ears
  const earOffsetAngle = expression === "flying" ? 0.35 : 0.12;
  // Left Ear
  ctx.save();
  ctx.translate(-r * 0.35, -r * 0.7);
  ctx.rotate(-earOffsetAngle);
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.8, r * 0.28, r * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = fur.main;
  ctx.strokeStyle = fur.stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  // Inner left ear
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.75, r * 0.14, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = fur.innerEar;
  ctx.fill();
  ctx.restore();

  // Right Ear
  ctx.save();
  ctx.translate(r * 0.35, -r * 0.7);
  ctx.rotate(earOffsetAngle);
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.8, r * 0.28, r * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = fur.main;
  ctx.strokeStyle = fur.stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  // Inner right ear
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.75, r * 0.14, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = fur.innerEar;
  ctx.fill();
  ctx.restore();

  // 3. Body / Vest
  ctx.beginPath();
  ctx.arc(0, r * 0.25, r * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = fur.main;
  ctx.strokeStyle = fur.stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Vest/Clothing
  ctx.beginPath();
  ctx.arc(0, r * 0.35, r * 0.75, 0.2, Math.PI - 0.2);
  ctx.fillStyle = "#F97316"; // Bright cheerful orange vest
  ctx.fill();

  // 4. Head
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = fur.main;
  ctx.strokeStyle = fur.stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // 5. Blushing Cheeks
  ctx.beginPath();
  ctx.arc(-r * 0.45, r * 0.05, r * 0.18, 0, Math.PI * 2);
  ctx.arc(r * 0.45, r * 0.05, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = fur.cheeks;
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;

  // 6. Eyes according to expression
  if (expression === "dizzy") {
    // Spiral / X eyes
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, -r * 0.2);
    ctx.lineTo(-r * 0.15, -r * 0.05);
    ctx.moveTo(-r * 0.15, -r * 0.2);
    ctx.lineTo(-r * 0.32, -r * 0.05);

    ctx.moveTo(r * 0.15, -r * 0.2);
    ctx.lineTo(r * 0.32, -r * 0.05);
    ctx.moveTo(r * 0.32, -r * 0.2);
    ctx.lineTo(r * 0.15, -r * 0.05);
    ctx.stroke();
  } else if (expression === "happy") {
    // Arc happy closed eyes
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-r * 0.24, -r * 0.1, r * 0.14, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.24, -r * 0.1, r * 0.14, Math.PI, 0);
    ctx.stroke();
  } else {
    // Big round cute eyes
    const eyeOffsetX = expression === "flying" ? 0.08 : 0;
    // Left eye
    ctx.beginPath();
    ctx.arc(-r * 0.24 + r * eyeOffsetX, -r * 0.12, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = "#0F172A";
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.arc(-r * 0.28 + r * eyeOffsetX, -r * 0.16, r * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(r * 0.24 + r * eyeOffsetX, -r * 0.12, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = "#0F172A";
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.arc(r * 0.2 + r * eyeOffsetX, -r * 0.16, r * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }

  // 7. Cute Nose & Whiskers
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#F43F5E";
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.35, 0);
  ctx.lineTo(-r * 0.7, -r * 0.05);
  ctx.moveTo(-r * 0.35, r * 0.08);
  ctx.lineTo(-r * 0.68, r * 0.12);
  ctx.moveTo(r * 0.35, 0);
  ctx.lineTo(r * 0.7, -r * 0.05);
  ctx.moveTo(r * 0.35, r * 0.08);
  ctx.lineTo(r * 0.68, r * 0.12);
  ctx.stroke();

  // Smile / Mouth
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.09, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // 8. Accessory: Glasses if enabled
  if (pet?.glasses && pet.glasses !== "none") {
    ctx.strokeStyle = "#D97706";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.12, r * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.12, r * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(-r * 0.07, -r * 0.12);
    ctx.lineTo(r * 0.07, -r * 0.12);
    ctx.stroke();
  }

  ctx.restore();
}
