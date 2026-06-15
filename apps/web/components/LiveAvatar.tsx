"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, RotateCw, Settings2, X } from "lucide-react";

type AvatarStats = {
  sex: "male" | "female";
  age: number;
  height: number;
  weight: number;
  waist: number;
  neck: number;
  hips: number;
  bodyFat?: number;
  bmi?: number;
  leanMass?: number;
  fatMass?: number;
  goalWeight: number;
  goalBodyFat: number;
};

type AvatarMetrics = {
  heightScale: number;
  leanNorm: number;
  fatNorm: number;
  shoulderW: number;
  chestW: number;
  ribW: number;
  waistW: number;
  hipsW: number;
  upperArmW: number;
  forearmW: number;
  handW: number;
  thighW: number;
  calfW: number;
  neckW: number;
  definition: number;
  softness: number;
};

const defaultStats: AvatarStats = {
  sex: "male",
  age: 21,
  height: 181,
  weight: 63,
  waist: 78,
  neck: 40,
  hips: 88,
  goalWeight: 70,
  goalBodyFat: 15
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round1 = (value: number) => Number(value).toFixed(1);
const kg = (value: number) => `${Number(value.toFixed(1)).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;

function estimateBodyFat(stats: AvatarStats) {
  if (Number.isFinite(stats.bodyFat)) return clamp(stats.bodyFat as number, 3, 60);
  const safeHeight = Math.max(90, stats.height);
  if (stats.sex === "female") {
    return clamp(495 / (1.29579 - 0.35004 * Math.log10(Math.max(1, stats.waist + stats.hips - stats.neck)) + 0.221 * Math.log10(safeHeight)) - 450, 3, 60);
  }
  return clamp(495 / (1.0324 - 0.19077 * Math.log10(Math.max(1, stats.waist - stats.neck)) + 0.15456 * Math.log10(safeHeight)) - 450, 3, 60);
}

function withDerivedStats(input: Partial<AvatarStats>): AvatarStats & { bodyFat: number; bmi: number; leanMass: number; fatMass: number } {
  const stats = { ...defaultStats, ...input };
  const heightM = stats.height / 100;
  const bmi = stats.bmi ?? stats.weight / Math.pow(heightM, 2);
  const bodyFat = estimateBodyFat(stats);
  const leanMass = stats.leanMass ?? stats.weight * (1 - bodyFat / 100);
  const fatMass = stats.fatMass ?? stats.weight - leanMass;
  return { ...stats, bodyFat, bmi, leanMass, fatMass };
}

function buildAvatarMetrics(stats: ReturnType<typeof withDerivedStats>, goal = false): AvatarMetrics {
  const targetDelta = stats.goalWeight - stats.weight;
  const heightM = stats.height / 100;
  const bodyFat = goal ? clamp(stats.goalBodyFat, 3, 45) : stats.bodyFat;
  const weight = goal ? stats.goalWeight : stats.weight;
  const bmi = weight / Math.pow(heightM, 2);
  const fatMass = weight * (bodyFat / 100);
  const leanMass = goal
    ? Math.max(weight * (1 - bodyFat / 100), stats.leanMass + Math.max(0, targetDelta) * .35 - Math.max(0, -targetDelta) * .08)
    : stats.leanMass;
  const ffmi = leanMass / Math.pow(heightM, 2);
  const fatMassIndex = fatMass / Math.pow(heightM, 2);
  const leanNorm = clamp((ffmi - 15.8) / 8.2, 0, 1);
  const bmiNorm = clamp((bmi - 18) / 12, 0, 1);
  const fatNorm = clamp(bodyFat / (stats.sex === "female" ? 36 : 30) * .72 + fatMassIndex / 12 * .28, 0, 1);
  const goalWaist = clamp(stats.waist + targetDelta * .18 - (stats.bodyFat - bodyFat) * .42, 48, 180);
  const goalHips = clamp(stats.hips + targetDelta * (stats.sex === "female" ? .18 : .1), 48, 190);
  const waist = goal ? goalWaist : stats.waist;
  const hips = goal ? goalHips : stats.hips;
  const maleBias = stats.sex === "male" ? 1 : 0;
  const baseShoulder = stats.sex === "male" ? 118 : 96;
  const shoulderW = clamp(baseShoulder + leanNorm * 26 + bmiNorm * 6 - fatNorm * 2, stats.sex === "male" ? 106 : 84, stats.sex === "male" ? 148 : 122);
  const chestW = clamp(shoulderW - (stats.sex === "male" ? 20 : 15) + leanNorm * 12 + fatNorm * 3, stats.sex === "male" ? 88 : 76, stats.sex === "male" ? 132 : 114);
  const waistW = clamp(waist / stats.height * 164 + fatNorm * 16 + bmiNorm * 4, stats.sex === "male" ? 62 : 58, stats.sex === "male" ? 120 : 116);
  const hipsW = clamp(hips / stats.height * 158 + fatNorm * 8 + bmiNorm * 2, stats.sex === "female" ? 86 : 72, stats.sex === "female" ? 132 : 116);
  const ribW = clamp(chestW - (stats.sex === "male" ? 12 : 8) + fatNorm * 5, 78, 124);
  const ageSoftness = clamp((stats.age - 35) / 55, 0, .07);
  return {
    heightScale: clamp(stats.height / (stats.sex === "male" ? 178 : 164), .9, 1.1),
    leanNorm,
    fatNorm,
    shoulderW,
    chestW,
    ribW,
    waistW,
    hipsW,
    upperArmW: clamp(18 + leanNorm * 11 + fatNorm * 4 + bmiNorm * 1.5 + maleBias * 1.6, 17, 34),
    forearmW: clamp((18 + leanNorm * 11 + fatNorm * 4 + bmiNorm * 1.5 + maleBias * 1.6) * .74, 14, 25),
    handW: 18,
    thighW: clamp(26 + leanNorm * 10 + fatNorm * 8 + bmiNorm * 2, 23, 44),
    calfW: clamp(19 + leanNorm * 7 + fatNorm * 3 + bmiNorm * 1.5, 17, 34),
    neckW: clamp(stats.neck / stats.height * 106 + leanNorm * 2, 18, stats.sex === "male" ? 33 : 28),
    definition: clamp(.9 - fatNorm * 1.05 + leanNorm * .32 - ageSoftness, .04, .86),
    softness: clamp(fatNorm * .32 + ageSoftness * .25, .04, .34)
  };
}

function ovalPath(cx: number, cy: number, rx: number, ry: number) {
  return `M${round1(cx)} ${round1(cy - ry)} C${round1(cx + rx)} ${round1(cy - ry)} ${round1(cx + rx)} ${round1(cy + ry)} ${round1(cx)} ${round1(cy + ry)} C${round1(cx - rx)} ${round1(cy + ry)} ${round1(cx - rx)} ${round1(cy - ry)} ${round1(cx)} ${round1(cy - ry)}Z`;
}

function torsoPath(center: number, topY: number, bottomY: number, topW: number, bottomW: number, curve = 14) {
  const leftTop = center - topW / 2;
  const rightTop = center + topW / 2;
  const leftBottom = center - bottomW / 2;
  const rightBottom = center + bottomW / 2;
  const sideCurve = Math.max(curve, Math.abs(topW - bottomW) * .22);
  return `M${round1(leftTop)} ${round1(topY)} C${round1(leftTop - sideCurve * .55)} ${round1(topY + 19)} ${round1(leftBottom - sideCurve * .28)} ${round1(bottomY - 22)} ${round1(leftBottom)} ${round1(bottomY)} C${round1(center - bottomW * .2)} ${round1(bottomY + 5)} ${round1(center + bottomW * .2)} ${round1(bottomY + 5)} ${round1(rightBottom)} ${round1(bottomY)} C${round1(rightBottom + sideCurve * .28)} ${round1(bottomY - 22)} ${round1(rightTop + sideCurve * .55)} ${round1(topY + 19)} ${round1(rightTop)} ${round1(topY)} C${round1(center + topW * .24)} ${round1(topY - 7)} ${round1(center - topW * .24)} ${round1(topY - 7)} ${round1(leftTop)} ${round1(topY)}Z`;
}

function shoulderPath(side: number, center: number, neckW: number, shoulderW: number) {
  const innerX = center + side * (neckW * .38);
  const clavicleX = center + side * (shoulderW * .28);
  const deltoidX = center + side * (shoulderW / 2 + 7);
  const armPitX = center + side * (shoulderW / 2 - 7);
  return `M${round1(innerX)} 98 C${round1(clavicleX)} 95 ${round1(center + side * shoulderW * .43)} 101 ${round1(deltoidX)} 116 C${round1(deltoidX + side * 9)} 126 ${round1(deltoidX + side * 4)} 142 ${round1(armPitX)} 150 C${round1(center + side * shoulderW * .28)} 137 ${round1(center + side * neckW * .55)} 120 ${round1(innerX)} 112Z`;
}

function pelvisPath(center: number, topY: number, bottomY: number, topW: number, hipW: number) {
  const leftTop = center - topW / 2;
  const rightTop = center + topW / 2;
  const leftHip = center - hipW * .44;
  const rightHip = center + hipW * .44;
  const leftLeg = center - hipW * .18;
  const rightLeg = center + hipW * .18;
  return `M${round1(leftTop)} ${round1(topY)} C${round1(leftHip)} ${round1(topY + 10)} ${round1(leftHip)} ${round1(bottomY - 12)} ${round1(leftLeg)} ${round1(bottomY)} C${round1(center - 10)} ${round1(bottomY + 7)} ${round1(center - 4)} ${round1(bottomY + 3)} ${round1(center)} ${round1(bottomY + 10)} C${round1(center + 4)} ${round1(bottomY + 3)} ${round1(center + 10)} ${round1(bottomY + 7)} ${round1(rightLeg)} ${round1(bottomY)} C${round1(rightHip)} ${round1(bottomY - 12)} ${round1(rightHip)} ${round1(topY + 10)} ${round1(rightTop)} ${round1(topY)} C${round1(center + topW * .24)} ${round1(topY + 9)} ${round1(center - topW * .24)} ${round1(topY + 9)} ${round1(leftTop)} ${round1(topY)}Z`;
}

function limbPath(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const p1x = x1 + nx * w1 / 2;
  const p1y = y1 + ny * w1 / 2;
  const p2x = x2 + nx * w2 / 2;
  const p2y = y2 + ny * w2 / 2;
  const p3x = x2 - nx * w2 / 2;
  const p3y = y2 - ny * w2 / 2;
  const p4x = x1 - nx * w1 / 2;
  const p4y = y1 - ny * w1 / 2;
  const bulge = Math.min(5, Math.max(1.5, w1 * .12));
  return `M${round1(p1x)} ${round1(p1y)} C${round1(x1 + dx * .26 + nx * (w1 * .18 + bulge))} ${round1(y1 + dy * .26 + ny * (w1 * .18 + bulge))} ${round1(x1 + dx * .72 + nx * (w2 * .16))} ${round1(y1 + dy * .72 + ny * (w2 * .16))} ${round1(p2x)} ${round1(p2y)} C${round1(x2 + dx * .025)} ${round1(y2 + dy * .025)} ${round1(p3x)} ${round1(p3y)} ${round1(p3x)} ${round1(p3y)} C${round1(x1 + dx * .72 - nx * (w2 * .16))} ${round1(y1 + dy * .72 - ny * (w2 * .16))} ${round1(x1 + dx * .26 - nx * (w1 * .18 + bulge))} ${round1(y1 + dy * .26 - ny * (w1 * .18 + bulge))} ${round1(p4x)} ${round1(p4y)} C${round1(x1 - dx * .025)} ${round1(y1 - dy * .025)} ${round1(p1x)} ${round1(p1y)} ${round1(p1x)} ${round1(p1y)}Z`;
}

function handPath(cx: number, cy: number, side: number, width: number, height: number) {
  return `M${round1(cx)} ${round1(cy - height / 2)} C${round1(cx + side * width * .65)} ${round1(cy - height * .42)} ${round1(cx + side * width * .66)} ${round1(cy + height * .35)} ${round1(cx + side * width * .18)} ${round1(cy + height / 2)} C${round1(cx - side * width * .42)} ${round1(cy + height * .42)} ${round1(cx - side * width * .5)} ${round1(cy - height * .28)} ${round1(cx)} ${round1(cy - height / 2)}Z`;
}

function footPath(cx: number, cy: number, side: number, width: number, height: number) {
  return `M${round1(cx - side * width * .42)} ${round1(cy - height * .35)} C${round1(cx + side * width * .18)} ${round1(cy - height * .58)} ${round1(cx + side * width * .72)} ${round1(cy - height * .18)} ${round1(cx + side * width * .76)} ${round1(cy + height * .2)} C${round1(cx + side * width * .42)} ${round1(cy + height * .55)} ${round1(cx - side * width * .56)} ${round1(cy + height * .48)} ${round1(cx - side * width * .7)} ${round1(cy + height * .06)} C${round1(cx - side * width * .64)} ${round1(cy - height * .22)} ${round1(cx - side * width * .56)} ${round1(cy - height * .32)} ${round1(cx - side * width * .42)} ${round1(cy - height * .35)}Z`;
}

function buildPaths(metrics: AvatarMetrics) {
  const center = 160;
  const shoulderX = metrics.shoulderW / 2 + 8;
  const elbowY = 212;
  const wristY = 296;
  const leftShoulder = { x: center - shoulderX, y: 127 };
  const rightShoulder = { x: center + shoulderX, y: 127 };
  const leftElbow = { x: center - shoulderX - 13, y: elbowY };
  const rightElbow = { x: center + shoulderX + 13, y: elbowY };
  const leftWrist = { x: leftElbow.x + 7, y: wristY };
  const rightWrist = { x: rightElbow.x - 7, y: wristY };
  const hipJoint = Math.max(metrics.hipsW * .24, 22);
  const leftHip = { x: center - hipJoint, y: 280 };
  const rightHip = { x: center + hipJoint, y: 280 };
  const leftKnee = { x: center - hipJoint - 4, y: 343 };
  const rightKnee = { x: center + hipJoint + 4, y: 343 };
  const leftAnkle = { x: leftKnee.x - 2, y: 390 };
  const rightAnkle = { x: rightKnee.x + 2, y: 390 };

  return {
    head: ovalPath(center, 52, 20, 25),
    neck: torsoPath(center, 74, 111, metrics.neckW * .82, metrics.neckW * 1.08, 4),
    shoulderL: shoulderPath(-1, center, metrics.neckW, metrics.shoulderW),
    shoulderR: shoulderPath(1, center, metrics.neckW, metrics.shoulderW),
    chest: torsoPath(center, 113, 173, metrics.chestW, metrics.ribW, 12),
    abdomen: torsoPath(center, 166, 234, metrics.ribW, metrics.waistW, 9),
    waist: torsoPath(center, 228, 252, metrics.waistW, Math.max(metrics.waistW * .88, 55), 4),
    pelvis: pelvisPath(center, 246, 282, Math.max(metrics.waistW * .98, 62), metrics.hipsW),
    upperArmL: limbPath(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y, metrics.upperArmW, metrics.upperArmW * .86),
    upperArmR: limbPath(rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y, metrics.upperArmW, metrics.upperArmW * .86),
    forearmL: limbPath(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y, metrics.forearmW, metrics.forearmW * .88),
    forearmR: limbPath(rightElbow.x, rightElbow.y, rightWrist.x, rightWrist.y, metrics.forearmW, metrics.forearmW * .88),
    handL: handPath(leftWrist.x, wristY + 9, -1, metrics.handW, 26),
    handR: handPath(rightWrist.x, wristY + 9, 1, metrics.handW, 26),
    thighL: limbPath(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y, metrics.thighW, metrics.thighW * .78),
    thighR: limbPath(rightHip.x, rightHip.y, rightKnee.x, rightKnee.y, metrics.thighW, metrics.thighW * .78),
    calfL: limbPath(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y, metrics.calfW, metrics.calfW * .7),
    calfR: limbPath(rightKnee.x, rightKnee.y, rightAnkle.x, rightAnkle.y, metrics.calfW, metrics.calfW * .7),
    footL: footPath(leftAnkle.x - 5, 399, -1, 34, 14),
    footR: footPath(rightAnkle.x + 5, 399, 1, 34, 14),
    softness: torsoPath(center, 166, 238, Math.max(metrics.ribW - 8, metrics.waistW + 12 + metrics.fatNorm * 8), metrics.waistW + 12 + metrics.fatNorm * 8, 9),
    chestLine: `M${round1(center - metrics.chestW * .28)} 142 C${round1(center - metrics.chestW * .1)} 136 ${round1(center + metrics.chestW * .1)} 136 ${round1(center + metrics.chestW * .28)} 142`,
    waistLineL: `M${round1(center - metrics.waistW * .16)} 176 C${round1(center - metrics.waistW * .22)} 198 ${round1(center - metrics.waistW * .17)} 220 ${round1(center - metrics.waistW * .08)} 238`,
    waistLineR: `M${round1(center + metrics.waistW * .16)} 176 C${round1(center + metrics.waistW * .22)} 198 ${round1(center + metrics.waistW * .17)} 220 ${round1(center + metrics.waistW * .08)} 238`
  };
}

function AvatarSvg({ stats }: { stats: ReturnType<typeof withDerivedStats> }) {
  const currentMetrics = buildAvatarMetrics(stats, false);
  const targetDelta = stats.goalWeight - stats.weight;
  const anatomyStyle = {
    "--avatar-width-scale": clamp(.92 + currentMetrics.leanNorm * .08 + currentMetrics.fatNorm * .08, .9, 1.1).toFixed(2),
    "--avatar-height-scale": currentMetrics.heightScale.toFixed(2),
    "--avatar-goal-scale": clamp(1 + targetDelta / Math.max(stats.weight, 1) * .22, .92, 1.12).toFixed(2),
    "--avatar-contrast": (1.02 + currentMetrics.definition * .28).toFixed(2),
    "--avatar-brightness": (.82 + currentMetrics.definition * .14 - currentMetrics.fatNorm * .04).toFixed(2)
  } as CSSProperties;

  return (
    <div className="live-avatar-image-wrap" style={anatomyStyle} role="img" aria-label="Anatomy-based live avatar">
      <img className="live-avatar-anatomy-goal" src="/assets/anatomy-avatar.png" alt="" aria-hidden="true" />
      <img className="live-avatar-anatomy-img" src="/assets/anatomy-avatar.png" alt="Anatomy-based live avatar" />
    </div>
  );
}

export default function LiveAvatar({ stats: inputStats = defaultStats }: { stats?: Partial<AvatarStats> }) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const stats = useMemo(() => withDerivedStats(inputStats), [inputStats]);
  const targetDelta = stats.goalWeight - stats.weight;

  return (
    <motion.article className="card live-avatar-card span-5" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="live-avatar-header">
        <div>
          <p className="eyebrow">// Live Avatar</p>
          <h2>Current Male Build</h2>
          <p className="muted">Your avatar evolves with your real progress.</p>
        </div>
        <div className="live-avatar-tools">
          <span className="badge">Target {targetDelta >= 0 ? "+" : ""}{round1(targetDelta)} kg</span>
          <button className="avatar-tool" type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)}>
            <RotateCw size={14} /> Auto Rotate
          </button>
          <button className="avatar-tool icon-only" type="button" aria-label="Avatar note" onClick={() => setInfoOpen(true)}>
            <Info size={15} />
          </button>
        </div>
      </div>

      <div className="live-avatar-stage">
        <div className="live-avatar-pill current">Current <span>{kg(stats.weight)}</span></div>
        <div className="live-avatar-pill goal">Goal <span>{kg(stats.goalWeight)}</span></div>
        <motion.div
          className="live-avatar-float"
          animate={reducedMotion ? undefined : { y: [5, -9, 5], x: [-2, 2, -2] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="live-avatar-rotate"
            animate={!reducedMotion && autoRotate ? { rotateY: [-8, 8, -8] } : { rotateY: 0 }}
            transition={{ duration: 7.8, repeat: autoRotate ? Infinity : 0, ease: "easeInOut" }}
            whileHover={!reducedMotion ? { rotateY: 4, rotateX: -1 } : undefined}
          >
            <AvatarSvg stats={stats} />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {infoOpen && (
          <motion.div className="avatar-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="avatar-modal" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }}>
              <button className="avatar-modal-close" type="button" onClick={() => setInfoOpen(false)} aria-label="Close avatar note"><X size={16} /></button>
              <Settings2 size={18} color="#63d68f" />
              <h3>Avatar Settings</h3>
              <p className="muted">This avatar is a visual estimate based on your entered measurements, not a medical body scan.</p>
              <p className="muted">Cosmetic controls can live here without crowding the main character panel.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
