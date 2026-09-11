/**
 * FitByte — Metric/imperial conversion + display helpers.
 * Storage stays metric (kg, cm) everywhere; these only affect how a number
 * is shown to, or entered by, the user.
 */
import type { Units } from '@/contexts/UnitsContext';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_IN;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return inches === 12 ? { feet: feet + 1, inches: 0 } : { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_IN;
}

/** e.g. "72.5 kg" or "159.8 lb" */
export function formatWeight(kg: number, units: Units, fractionDigits = 1): string {
  if (units === 'imperial') return `${kgToLb(kg).toFixed(fractionDigits)} lb`;
  return `${kg.toFixed(fractionDigits)} kg`;
}

/** e.g. "175 cm" or `5'9"` */
export function formatHeight(cm: number, units: Units): string {
  if (units === 'imperial') {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(cm)} cm`;
}

/** Short unit label for input suffixes, e.g. next to a weight text field. */
export function weightUnitLabel(units: Units): string {
  return units === 'imperial' ? 'lb' : 'kg';
}

/** Parses a weight typed in the current display unit back into kg for storage. */
export function parseWeightToKg(value: number, units: Units): number {
  return units === 'imperial' ? lbToKg(value) : value;
}
