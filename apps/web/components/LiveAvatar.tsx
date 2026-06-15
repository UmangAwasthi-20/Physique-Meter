"use client";

import { useMemo, useState } from "react";
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
  const baseShoulder = stats.sex === "male" ? 88 : 96;
  const shoulderW = clamp(baseShoulder + leanNorm * 50 + bmiNorm * 6 - fatNorm, stats.sex === "male" ? 84 : 84, stats.sex === "male" ? 150 : 122);
  const chestW = clamp(shoulderW - (stats.sex === "male" ? 28 : 15) + leanNorm * 17 + fatNorm * 2, stats.sex === "male" ? 70 : 76, stats.sex === "male" ? 134 : 114);
  const waistW = clamp(waist / stats.height * 145 + fatNorm * 18 + bmiNorm * 5, stats.sex === "male" ? 56 : 56, stats.sex === "male" ? 122 : 118);
  const hipsW = clamp(hips / stats.height * 158 + fatNorm * 8 + bmiNorm * 2, stats.sex === "female" ? 86 : 72, stats.sex === "female" ? 132 : 116);
  const ribW = clamp(chestW - (stats.sex === "male" ? 12 : 8) + fatNorm * 4, stats.sex === "male" ? 62 : 68, 124);
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
    upperArmW: clamp(12.8 + leanNorm * 13.5 + fatNorm * 5 + bmiNorm * 1.8 + maleBias, 12, 34),
    forearmW: clamp((12.8 + leanNorm * 13.5 + fatNorm * 5 + bmiNorm * 1.8 + maleBias) * .74, 10.5, 25),
    handW: 18,
    thighW: clamp(20 + leanNorm * 13 + fatNorm * 9 + bmiNorm * 2.5, 18, 44),
    calfW: clamp(14.5 + leanNorm * 8.5 + fatNorm * 3.8 + bmiNorm * 1.5, 13.5, 34),
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

function coreTorsoPath(center: number, chestW: number, ribW: number, waistW: number, softness = 0) {
  const leftChest = center - chestW / 2;
  const rightChest = center + chestW / 2;
  const leftRib = center - ribW / 2;
  const rightRib = center + ribW / 2;
  const leftWaist = center - waistW / 2;
  const rightWaist = center + waistW / 2;
  const soft = softness * 10;
  return `M${round1(leftChest)} 114 C${round1(leftChest - 8 - soft)} 132 ${round1(leftRib - 7 - soft)} 156 ${round1(leftRib)} 176 C${round1(leftRib - 2 - soft)} 197 ${round1(leftWaist - 5 - soft)} 226 ${round1(leftWaist)} 251 C${round1(center - waistW * .28)} 260 ${round1(center + waistW * .28)} 260 ${round1(rightWaist)} 251 C${round1(rightWaist + 5 + soft)} 226 ${round1(rightRib + 2 + soft)} 197 ${round1(rightRib)} 176 C${round1(rightRib + 7 + soft)} 156 ${round1(rightChest + 8 + soft)} 132 ${round1(rightChest)} 114 C${round1(center + chestW * .2)} 106 ${round1(center - chestW * .2)} 106 ${round1(leftChest)} 114Z`;
}

function shoulderPath(side: number, center: number, neckW: number, shoulderW: number) {
  const innerX = center + side * (neckW * .38);
  const clavicleX = center + side * (shoulderW * .28);
  const deltoidX = center + side * (shoulderW / 2 + 7);
  const armPitX = center + side * (shoulderW / 2 - 7);
  return `M${round1(innerX)} 101 C${round1(clavicleX)} 97 ${round1(center + side * shoulderW * .43)} 103 ${round1(deltoidX)} 118 C${round1(deltoidX + side * 6)} 130 ${round1(deltoidX + side * 3)} 143 ${round1(armPitX)} 149 C${round1(center + side * shoulderW * .28)} 138 ${round1(center + side * neckW * .55)} 121 ${round1(innerX)} 113Z`;
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
  const elbowY = 220;
  const wristY = 304;
  const leftShoulder = { x: center - shoulderX, y: 136 };
  const rightShoulder = { x: center + shoulderX, y: 136 };
  const leftElbow = { x: center - shoulderX - 11, y: elbowY };
  const rightElbow = { x: center + shoulderX + 11, y: elbowY };
  const leftWrist = { x: leftElbow.x + 7, y: wristY };
  const rightWrist = { x: rightElbow.x - 7, y: wristY };
  const hipJoint = Math.max(metrics.hipsW * .21, 18);
  const leftHip = { x: center - hipJoint, y: 274 };
  const rightHip = { x: center + hipJoint, y: 274 };
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
    waist: torsoPath(center, 224, 252, metrics.waistW, Math.max(metrics.waistW * .84, 52), 6),
    core: coreTorsoPath(center, metrics.chestW, metrics.ribW, metrics.waistW, metrics.softness),
    pelvis: pelvisPath(center, 246, 274, Math.max(metrics.waistW * .84, 52), metrics.hipsW * .86),
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

const avatarRegionOrder = [
  "head",
  "neck",
  "shoulderL",
  "shoulderR",
  "chest",
  "abdomen",
  "waist",
  "pelvis",
  "upperArmL",
  "upperArmR",
  "forearmL",
  "forearmR",
  "handL",
  "handR",
  "thighL",
  "thighR",
  "calfL",
  "calfR",
  "footL",
  "footR"
] as const;

function AvatarSvg({ stats }: { stats: ReturnType<typeof withDerivedStats> }) {
  const currentMetrics = buildAvatarMetrics(stats, false);
  const goalMetrics = buildAvatarMetrics(stats, true);
  const current = buildPaths(currentMetrics);
  const goal = buildPaths(goalMetrics);
  const currentTransform = `translate(160 398) scale(1 ${currentMetrics.heightScale.toFixed(2)}) translate(-160 -398)`;
  const goalTransform = `translate(160 398) scale(1 ${goalMetrics.heightScale.toFixed(2)}) translate(-160 -398)`;

  return (
    <svg className="live-avatar-svg" viewBox="0 0 320 420" role="img" aria-labelledby="liveAvatarTitle">
      <title id="liveAvatarTitle">Dynamic fitness game avatar built from current measurements</title>
      <defs>
        <radialGradient id="liveFloorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#63d68f" stopOpacity=".42" />
          <stop offset="46%" stopColor="#1184ff" stopOpacity=".18" />
          <stop offset="100%" stopColor="#1184ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="liveSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd8bd" />
          <stop offset="62%" stopColor="#f2b184" />
          <stop offset="100%" stopColor="#9f5d45" />
        </linearGradient>
        <linearGradient id="liveShorts" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#182332" />
          <stop offset="54%" stopColor="#101821" />
          <stop offset="100%" stopColor="#071018" />
        </linearGradient>
      </defs>

      <ellipse className="live-avatar-shadow" cx="160" cy="386" rx="96" ry="20" fill="url(#liveFloorGlow)" />
      <g opacity=".55" transform={goalTransform}>
        {avatarRegionOrder.map((region) => (
          <path key={region} className="live-avatar-goal" d={goal[region]} />
        ))}
      </g>

      <g className="live-avatar-current" transform={currentTransform}>
        <path className="live-avatar-skin" d={current.neck} />
        <path className="live-avatar-skin" d={current.shoulderL} />
        <path className="live-avatar-skin" d={current.shoulderR} />
        <path className="live-avatar-skin" d={current.upperArmL} />
        <path className="live-avatar-skin" d={current.upperArmR} />
        <path className="live-avatar-skin" d={current.forearmL} />
        <path className="live-avatar-skin" d={current.forearmR} />
        <path className="live-avatar-skin" d={current.handL} />
        <path className="live-avatar-skin" d={current.handR} />
        <path className="live-avatar-skin" d={current.thighL} />
        <path className="live-avatar-skin" d={current.thighR} />
        <path className="live-avatar-skin" d={current.calfL} />
        <path className="live-avatar-skin" d={current.calfR} />
        <path className="live-avatar-shoe" d={current.footL} />
        <path className="live-avatar-shoe" d={current.footR} />
        <path className="live-avatar-skin" d={current.chest} />
        <path className="live-avatar-skin" d={current.abdomen} />
        <path className="live-avatar-skin" d={current.waist} />
        <path className="live-avatar-skin live-avatar-chest" d={current.core} />
        <path className="live-avatar-shorts" d={current.pelvis} />
        <path className="live-avatar-skin" d={current.head} />
        <path className="live-avatar-hair" d="M132 45 C135 22 151 17 160 22 C173 16 187 27 188 48 C176 41 169 40 160 46 C150 39 142 40 132 45Z" />
        <path className="live-avatar-face" d="M150 58 C152 56 154 56 156 58 C154 60 152 60 150 58Z" />
        <path className="live-avatar-face" d="M164 58 C166 56 168 56 170 58 C168 60 166 60 164 58Z" />
        <path d="M153 70 C157 73 164 73 168 70" fill="none" stroke="rgba(7,10,16,.55)" strokeWidth="2" strokeLinecap="round" />
        <path d={current.softness} fill="rgba(255,255,255,.14)" opacity={currentMetrics.softness} />
        <path className="live-avatar-definition" d={current.chestLine} opacity={currentMetrics.definition} />
        <path className="live-avatar-definition" d={current.waistLineL} opacity={currentMetrics.definition} />
        <path className="live-avatar-definition" d={current.waistLineR} opacity={currentMetrics.definition} />
      </g>

      <path className="live-avatar-hologram-line" d="M64 374 C92 398 228 398 256 374" fill="none" />
    </svg>
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
