"use strict";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function estimateMeasurements(sex, heightCm, weightKg) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const neck = sex === "male" ? heightCm * 0.22 : heightCm * 0.19;
  const waist = sex === "male"
    ? heightCm * (0.43 + Math.max(0, bmi - 22) * 0.008)
    : heightCm * (0.39 + Math.max(0, bmi - 21) * 0.008);
  const hips = sex === "female"
    ? heightCm * (0.55 + Math.max(0, bmi - 21) * 0.006)
    : heightCm * 0.52;

  return {
    neck: Math.round(neck),
    waist: Math.round(waist),
    hips: Math.round(hips)
  };
}

function calculatePhysique(input) {
  const sex = input.sex || input.gender || "male";
  const height = Number(input.heightCm || input.height);
  const weight = Number(input.weightKg || input.weight);
  const goal = Number(input.goalBodyFat || input.goal || 14);
  const estimated = estimateMeasurements(sex, height, weight);
  const neck = Number(input.neckCm || input.neck || estimated.neck);
  const waist = Number(input.waistCm || input.waist || estimated.waist);
  const hips = Number(input.hipsCm || input.hips || estimated.hips);

  if (!Number.isFinite(height) || height < 90 || height > 230) {
    throw new Error("heightCm must be between 90 and 230");
  }
  if (!Number.isFinite(weight) || weight < 30 || weight > 260) {
    throw new Error("weightKg must be between 30 and 260");
  }

  let bodyFat;
  if (sex === "male") {
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
  }

  bodyFat = clamp(bodyFat, 3, 60);
  const bmi = weight / Math.pow(height / 100, 2);
  const fatMassKg = weight * bodyFat / 100;
  const leanMassKg = weight - fatMassKg;
  const targetWeightKg = leanMassKg / (1 - goal / 100);
  const toGoalKg = targetWeightKg - weight;

  return {
    bodyFat,
    bmi,
    fatMassKg,
    leanMassKg,
    targetWeightKg,
    toGoalKg,
    goalBodyFat: goal,
    measurements: { neckCm: neck, waistCm: waist, hipsCm: hips }
  };
}

module.exports = {
  calculatePhysique,
  estimateMeasurements
};
