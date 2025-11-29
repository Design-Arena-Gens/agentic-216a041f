export type SpeedSetting = "standard" | "fast" | "very-fast";

export type DamageMultiplierOption = {
  label: string;
  value: number;
};

export type SpeedOption = {
  label: string;
  value: SpeedSetting;
  multiplier: number;
  description: string;
};

export const DAMAGE_MULTIPLIER_OPTIONS: DamageMultiplierOption[] = [
  { label: "1.0× (Такт в такт)", value: 1 },
  { label: "1.5× (Ускоренный огонь)", value: 1.5 },
  { label: "2.0× (Штурмовой режим)", value: 2 },
  { label: "2.5× (Экстренный урон)", value: 2.5 },
];

export const SPEED_OPTIONS: SpeedOption[] = [
  {
    label: "Стандарт",
    value: "standard",
    multiplier: 1,
    description: "Базовая скорость перемещения умных тиммейтов.",
  },
  {
    label: "Быстро",
    value: "fast",
    multiplier: 1.4,
    description: "Увеличенная скорость для агрессивного преследования.",
  },
  {
    label: "Очень быстро",
    value: "very-fast",
    multiplier: 1.85,
    description: "Максимальная скорость реагирования и фланговый натиск.",
  },
];

export const SPEED_MULTIPLIERS = SPEED_OPTIONS.reduce<Record<SpeedSetting, number>>(
  (acc, option) => {
    acc[option.value] = option.multiplier;
    return acc;
  },
  {
    standard: 1,
    fast: 1,
    "very-fast": 1,
  },
);

export const DEFAULT_DAMAGE_MULTIPLIER = DAMAGE_MULTIPLIER_OPTIONS[0].value;
export const DEFAULT_SPEED_SETTING: SpeedSetting = "standard";
