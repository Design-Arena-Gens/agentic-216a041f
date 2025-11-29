"use client";

import { DAMAGE_MULTIPLIER_OPTIONS, SPEED_OPTIONS } from "@/lib/settings";
import type { SpeedSetting } from "@/lib/settings";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type Props = {
  damageMultiplier: number;
  speedSetting: SpeedSetting;
  onDamageMultiplierChange: (value: number) => void;
  onSpeedSettingChange: (value: SpeedSetting) => void;
  hydrated: boolean;
};

function SelectChevron() {
  return (
    <ChevronDownIcon className="size-4 text-zinc-500 transition-transform group-focus-within:-rotate-180" />
  );
}

export function ModSettings({
  damageMultiplier,
  speedSetting,
  onDamageMultiplierChange,
  onSpeedSettingChange,
  hydrated,
}: Props) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <header className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
          Mod Options
        </span>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Настройки SmartTeammates
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Отрегулируйте боевые параметры умных тиммейтов Skyline прямо во время
          сражения. Все изменения сохраняются локально и применяются сразу.
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Множитель урона
          </label>
          <div className="group relative">
            <select
              className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 pr-10 text-sm font-medium text-zinc-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:focus:border-emerald-400"
              value={hydrated ? damageMultiplier : DAMAGE_MULTIPLIER_OPTIONS[0].value}
              onChange={(event) =>
                onDamageMultiplierChange(parseFloat(event.target.value))
              }
              aria-label="Множитель урона для умных тиммейтов"
            >
              {DAMAGE_MULTIPLIER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <SelectChevron />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Скорость передвижения
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {SPEED_OPTIONS.map((option) => {
              const checked = (hydrated ? speedSetting : "standard") === option.value;
              return (
                <label
                  key={option.value}
                  className={`group flex cursor-pointer flex-col rounded-2xl border px-4 py-3 transition shadow-sm ${
                    checked
                      ? "border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/20 dark:border-emerald-400 dark:bg-emerald-400/10"
                      : "border-zinc-200 bg-white/70 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-emerald-400/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {option.label}
                    </span>
                    <span
                      className={`size-2 rounded-full transition ${
                        checked
                          ? "bg-emerald-500 shadow shadow-emerald-500/40 dark:bg-emerald-400"
                          : "bg-zinc-300 group-hover:bg-emerald-300 dark:bg-zinc-600"
                      }`}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                    {option.description}
                  </p>
                  <input
                    type="radio"
                    className="hidden"
                    name="speed-option"
                    value={option.value}
                    checked={checked}
                    onChange={() => onSpeedSettingChange(option.value)}
                    aria-label={`Скорость ${option.label}`}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm text-zinc-600 shadow-inner dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          <p>
            Текущая конфигурация усиливает боевые показатели тиммейтов: выбранный
            множитель урона применяется при ударе по целям, а скорость отвечает за
            их агрессивность при смене позиции и преследовании врагов.
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Skyline · SmartTeammates v1.0
          </p>
        </div>
      </div>
    </section>
  );
}
