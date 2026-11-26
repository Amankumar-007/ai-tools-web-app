/** Unit conversion. Each category has a base unit; every unit is a factor to that base (temperature is handled separately). */

export interface UnitDef { id: string; label: string; /** Multiply a value in this unit by `factor` to get the base unit. */ factor: number }
export interface Category { id: string; label: string; base: string; units: UnitDef[] }

const u = (id: string, label: string, factor: number): UnitDef => ({ id, label, factor });

export const CATEGORIES: Category[] = [
  { id: 'length', label: 'Length', base: 'm', units: [u('mm', 'Millimetre (mm)', 0.001), u('cm', 'Centimetre (cm)', 0.01), u('m', 'Metre (m)', 1), u('km', 'Kilometre (km)', 1000), u('in', 'Inch (in)', 0.0254), u('ft', 'Foot (ft)', 0.3048), u('yd', 'Yard (yd)', 0.9144), u('mi', 'Mile (mi)', 1609.344), u('nmi', 'Nautical mile', 1852)] },
  { id: 'mass', label: 'Weight', base: 'kg', units: [u('mg', 'Milligram (mg)', 1e-6), u('g', 'Gram (g)', 0.001), u('kg', 'Kilogram (kg)', 1), u('quintal', 'Quintal (100 kg)', 100), u('tonne', 'Tonne (1000 kg)', 1000), u('oz', 'Ounce (oz)', 0.028349523125), u('lb', 'Pound (lb)', 0.45359237), u('st', 'Stone (st)', 6.35029318), u('tola', 'Tola (11.6638 g)', 0.0116638038)] },
  { id: 'area', label: 'Area', base: 'm2', units: [u('sqft', 'Square foot (sq ft)', 0.09290304), u('sqyd', 'Square yard / gaj', 0.83612736), u('m2', 'Square metre (m²)', 1), u('guntha', 'Guntha (1089 sq ft)', 101.17141056), u('acre', 'Acre', 4046.8564224), u('hectare', 'Hectare', 10000), u('km2', 'Square kilometre (km²)', 1e6), u('sqmi', 'Square mile', 2589988.110336)] },
  { id: 'volume', label: 'Volume', base: 'l', units: [u('ml', 'Millilitre (ml)', 0.001), u('l', 'Litre (l)', 1), u('m3', 'Cubic metre (m³)', 1000), u('tsp', 'Teaspoon (US)', 0.00492892159375), u('tbsp', 'Tablespoon (US)', 0.01478676478125), u('cup', 'Cup (US)', 0.2365882365), u('floz', 'Fluid ounce (US)', 0.0295735295625), u('pint', 'Pint (US)', 0.473176473), u('gal', 'Gallon (US)', 3.785411784)] },
  { id: 'speed', label: 'Speed', base: 'mps', units: [u('mps', 'Metre/second (m/s)', 1), u('kmh', 'Kilometre/hour (km/h)', 1 / 3.6), u('mph', 'Mile/hour (mph)', 0.44704), u('kn', 'Knot', 1852 / 3600), u('fps', 'Foot/second (ft/s)', 0.3048)] },
  { id: 'data', label: 'Data', base: 'B', units: [u('bit', 'Bit', 1 / 8), u('B', 'Byte (B)', 1), u('KB', 'Kilobyte (KB, 1000 B)', 1e3), u('MB', 'Megabyte (MB)', 1e6), u('GB', 'Gigabyte (GB)', 1e9), u('TB', 'Terabyte (TB)', 1e12), u('KiB', 'Kibibyte (KiB, 1024 B)', 1024), u('MiB', 'Mebibyte (MiB)', 1024 ** 2), u('GiB', 'Gibibyte (GiB)', 1024 ** 3), u('TiB', 'Tebibyte (TiB)', 1024 ** 4)] },
  { id: 'time', label: 'Time', base: 's', units: [u('ms', 'Millisecond (ms)', 0.001), u('s', 'Second (s)', 1), u('min', 'Minute (min)', 60), u('h', 'Hour (h)', 3600), u('day', 'Day', 86400), u('week', 'Week', 604800), u('month', 'Month (average)', 2629800), u('year', 'Year (365.25 days)', 31557600)] },
  { id: 'temperature', label: 'Temperature', base: 'C', units: [u('C', 'Celsius (°C)', 1), u('F', 'Fahrenheit (°F)', 1), u('K', 'Kelvin (K)', 1)] },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

const toCelsius = (v: number, from: string) => (from === 'F' ? ((v - 32) * 5) / 9 : from === 'K' ? v - 273.15 : v);
const fromCelsius = (c: number, to: string) => (to === 'F' ? (c * 9) / 5 + 32 : to === 'K' ? c + 273.15 : c);

export function convert(value: number, categoryId: string, from: string, to: string): number | null {
  const category = getCategory(categoryId);
  if (!category || !Number.isFinite(value)) return null;
  const a = category.units.find((x) => x.id === from);
  const b = category.units.find((x) => x.id === to);
  if (!a || !b) return null;
  if (categoryId === 'temperature') {
    const c = toCelsius(value, from);
    if (c < -273.15 - 1e-9) return null; // below absolute zero
    return fromCelsius(c, to);
  }
  return (value * a.factor) / b.factor;
}

/** Up to 10 significant digits, no scientific noise for ordinary numbers, trailing zeros trimmed. */
export function formatUnitValue(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-7) return n.toExponential(6).replace(/\.?0+e/, 'e');
  const rounded = Number(n.toPrecision(10));
  return rounded.toLocaleString('en-IN', { maximumFractionDigits: 10, useGrouping: abs >= 1000 });
}
