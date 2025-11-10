/**
 * Moon Phase Calculation Service
 * Calculates the current moon phase without external APIs.
 * Based on a simplified version of the well-known astronomical algorithm.
 */

// Known new moon: January 6, 2000, 18:14 UTC
const KNOWN_NEW_MOON_JULIAN = 2451549.5; 
// Synodic month (new moon to new moon) in days
const LUNAR_CYCLE_DAYS = 29.53058867;

interface MoonPhase {
    name: string;
    description: string;
    iconKey: 'NewMoon' | 'WaxingCrescent' | 'FirstQuarter' | 'WaxingGibbous' | 'FullMoon' | 'WaningGibbous' | 'LastQuarter' | 'WaningCrescent';
    fullDescription: string;
}

const phases: MoonPhase[] = [
    { name: 'Nieuwe Maan', description: 'Een tijd voor nieuwe starts', iconKey: 'NewMoon', fullDescription: 'Nieuwe Maan (perfect voor nieuwe starts en intenties zetten)' },
    { name: 'Wassende Sikkel', description: 'Een tijd voor intenties en hoop', iconKey: 'WaxingCrescent', fullDescription: 'Wassende Maan (ideaal voor groei, aantrekken en opbouwen)' },
    { name: 'Eerste Kwartier', description: 'Een tijd voor actie en uitdagingen', iconKey: 'FirstQuarter', fullDescription: 'Wassende Maan (ideaal voor groei, aantrekken en opbouwen)' },
    { name: 'Wassende Maan', description: 'Een tijd voor verfijning en aanpassing', iconKey: 'WaxingGibbous', fullDescription: 'Wassende Maan (ideaal voor groei, aantrekken en opbouwen)' },
    { name: 'Volle Maan', description: 'Een piek van energie en manifestatie', iconKey: 'FullMoon', fullDescription: 'Volle Maan (een piek van energie, krachtig voor loslaten en manifestatie)' },
    { name: 'Afnemende Maan', description: 'Een tijd voor dankbaarheid en loslaten', iconKey: 'WaningGibbous', fullDescription: 'Afnemende Maan (geschikt voor loslaten, reinigen en naar binnen keren)' },
    { name: 'Laatste Kwartier', description: 'Een tijd voor loslaten en vergeven', iconKey: 'LastQuarter', fullDescription: 'Afnemende Maan (geschikt voor loslaten, reinigen en naar binnen keren)' },
    { name: 'Afnemende Sikkel', description: 'Een tijd voor rust en overgave', iconKey: 'WaningCrescent', fullDescription: 'Afnemende Maan (geschikt voor loslaten, reinigen en naar binnen keren)' },
];

/**
 * Calculates the current phase of the moon.
 * @param date The date for which to calculate the moon phase. Defaults to now.
 * @returns A MoonPhase object with the name, description, and icon key.
 */
export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
    // Julian date calculation
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    const julianDate = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const daysSinceNewMoon = julianDate - KNOWN_NEW_MOON_JULIAN;
    const phase = (daysSinceNewMoon / LUNAR_CYCLE_DAYS) % 1;

    // Determine the phase index (0-7)
    const phaseIndex = Math.floor(phase * 8 + 0.5) & 7;

    return phases[phaseIndex];
};
