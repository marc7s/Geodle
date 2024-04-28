export function getFormattedRelativeTime(date: Date) {
  return getFormattedElapsedTime(Date.now() - date.valueOf());
}

type TimeUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';
type DistanceUnit = 'km' | 'm';
type RelativeUnitConversion = [TimeUnit | DistanceUnit, number];

/**
 * @param {number} elapsedMS - The number of elapsed milliseconds to format
 * @example
 * getFormattedElapsedTime(3000)
 * '3 seconds'
 * @example getFormattedElapsedTime(12060000)
 * '3 hours 21 minutes'
 * @returns A formatted string of relative elapsed time
 * */
export function getFormattedElapsedTime(elapsedMS: number) {
  return getFormattedValue(
    elapsedMS / 1000,
    [
      ['years', 60 * 60 * 24 * 365],
      ['months', 60 * 60 * 24 * 30],
      ['days', 60 * 60 * 24],
      ['hours', 60 * 60],
      ['minutes', 60],
      ['seconds', 1],
    ],
    ['seconds', 1],
    true
  );
}

/**
 * @param {number} distanceM - The distance in meters to format
 * @example
 * getFormattedDistance(12)
 * '12 m'
 * @example getFormattedDistance(120_100)
 * '120 km'
 * @returns A formatted string of relative distance
 * */
export function getFormattedDistance(distanceM: number) {
  return getFormattedValue(
    distanceM,
    [
      ['km', 1000],
      ['m', 1],
    ],
    ['km', 1000],
    false
  );
}

/**
 * @param {number} value - The value to format
 * @param {RelativeUnitConversion[] relativeUnitConversions} - The list of conversions for the relative units
 * @param {RelativeUnitConversion fallback} - The relative unit to fallback to, should the formatting fail
 * @param {boolean stripPluralS} - Whether to strip an ending 's', when the amount is 1. For example, if the relative unit is 'seconds', you would like to strip it to display '1 second' but '2 seconds'
 * @param {boolean includeLowerUnit} - Whether to include the lower unit, if it exists. For example, displaying '12 minutes 3 seconds' or just '12 minutes'
 * @returns A formatted string of relative elapsed time
 * */
function getFormattedValue(
  value: number,
  relativeUnitConversions: RelativeUnitConversion[],
  fallback: RelativeUnitConversion,
  stripPluralS: boolean,
  includeLowerUnit: boolean = false
): string {
  if (isNaN(value)) return 'NaN';

  let relativeUnit: RelativeUnitConversion | undefined = undefined;
  let relativeLowerUnit: RelativeUnitConversion | undefined = undefined;

  function getUnitAmount(
    amount: number,
    [_, amountInUnit]: RelativeUnitConversion,
    round: boolean
  ) {
    const unitAmount: number = amount / amountInUnit;
    return Math.max(0, round ? Math.round(unitAmount) : Math.floor(unitAmount));
  }

  function formatAmountAndUnit(
    amount: number,
    unitConversion: RelativeUnitConversion,
    round: boolean
  ): string {
    const [unit, _] = unitConversion;
    const unitAmount: number = getUnitAmount(amount, unitConversion, round);
    return `${unitAmount} ${stripPluralS && unitAmount == 1 ? unit.slice(0, -1) : unit}`;
  }

  for (const uDiff of relativeUnitConversions) {
    const timeUnit = uDiff[0];

    // If we found the unit in the last iteration, we are now at the lower unit
    if (relativeUnit !== undefined) {
      relativeLowerUnit = uDiff;
      break;
    }

    // If we have reached a small enough unit, or we are at the smallest unit
    if (
      getUnitAmount(value, uDiff, true) > 0 ||
      timeUnit ===
        relativeUnitConversions[relativeUnitConversions.length - 1][0]
    ) {
      relativeUnit = uDiff;
    }
  }

  // Fallback
  if (relativeUnit === undefined)
    return `${value / fallback[1]} ${fallback[0]}`;

  // If we include a lower unit, we do not want to round but instead floor, as it will otherwise display incorrectly in some cases
  const formattedUnit: string = formatAmountAndUnit(
    value,
    relativeUnit,
    !includeLowerUnit
  );
  if (includeLowerUnit)
    return `${formattedUnit}${relativeLowerUnit === undefined ? '' : ' ' + formatAmountAndUnit(value - getUnitAmount(value, relativeUnit, true) * relativeUnit[1], relativeLowerUnit, true)}`;
  return formattedUnit;
}
