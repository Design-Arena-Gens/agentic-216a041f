'use client';

import { ModSettings } from "./components/mod-settings";
import { TeammateSimulation } from "./components/teammate-simulation";
import {
  DAMAGE_MULTIPLIER_OPTIONS,
  DEFAULT_DAMAGE_MULTIPLIER,
  DEFAULT_SPEED_SETTING,
  SPEED_OPTIONS,
  type SpeedSetting,
} from "@/lib/settings";
import { usePersistentState } from "@/lib/usePersistentState";

const DAMAGE_KEY = "smartteammates:damageMultiplier";
const SPEED_KEY = "smartteammates:speedSetting";

function resolveDamageLabel(multiplier: number) {
  return (
    DAMAGE_MULTIPLIER_OPTIONS.find((option) => option.value === multiplier)
      ?.label ?? `${multiplier.toFixed(1)}×`
  );
}

function resolveSpeedLabel(setting: SpeedSetting) {
  return SPEED_OPTIONS.find((option) => option.value === setting)?.label ?? setting;
}

export default function Home() {
  const [damageMultiplier, setDamageMultiplier, damageHydrated] =
    usePersistentState<number>(DAMAGE_KEY, DEFAULT_DAMAGE_MULTIPLIER);
  const [speedSetting, setSpeedSetting, speedHydrated] = usePersistentState<SpeedSetting>(
    SPEED_KEY,
    DEFAULT_SPEED_SETTING,
  );

  const settingsHydrated = damageHydrated && speedHydrated;

  return (
    <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-8 lg:flex-row">
        <aside className="flex w-full flex-col gap-8 lg:w-[360px]">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="absolute inset-x-10 -top-20 h-40 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="relative space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                Skyline presents
              </span>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
                SmartTeammates
              </h1>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Полноценная модификация для усиления союзных ИИ-тиммейтов. Настройте
                урон и скорость, чтобы тиммейты Skyline действовали агрессивно, умно и
                результативно — прямо как вы ожидали от боевой поддержки.
              </p>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 dark:bg-white/5">
                  Автор: Skyline
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                  Версия 1.0.0
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-700 shadow-inner shadow-emerald-500/20 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200">
                <p>
                  Активные параметры:{" "}
                  <span className="font-semibold">
                    {resolveDamageLabel(settingsHydrated ? damageMultiplier : DEFAULT_DAMAGE_MULTIPLIER)}
                  </span>{" "}
                  урона и режим скорости{" "}
                  <span className="font-semibold">
                    {resolveSpeedLabel(settingsHydrated ? speedSetting : DEFAULT_SPEED_SETTING)}
                  </span>
                  . Настройки сохраняются автоматически.
                </p>
              </div>
            </div>
          </section>

          <ModSettings
            damageMultiplier={damageMultiplier}
            speedSetting={speedSetting}
            onDamageMultiplierChange={setDamageMultiplier}
            onSpeedSettingChange={setSpeedSetting}
            hydrated={settingsHydrated}
          />

          <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Что делает мод?
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-emerald-500" />
                <span>
                  Усиливает урон союзных ботов за счёт настраиваемого множителя — от
                  точечных ударов до штурмового режима.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-sky-500" />
                <span>
                  Предлагает выбор скоростных профилей, позволяющих быстро фокусить цели
                  или оставаться рядом с игроком.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-fuchsia-500" />
                <span>
                  Встроенный обучающий симулятор демонстрирует, как выбранные параметры
                  влияют на эффективность.
                </span>
              </li>
            </ul>
          </section>
        </aside>

        <div className="flex w-full flex-col gap-8 pb-16">
          <TeammateSimulation
            damageMultiplier={settingsHydrated ? damageMultiplier : DEFAULT_DAMAGE_MULTIPLIER}
            speedSetting={settingsHydrated ? speedSetting : DEFAULT_SPEED_SETTING}
          />

          <section className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Рекомендации по применению
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-300">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Соответствие роли
                </h3>
                <p className="mt-2">
                  Для защитных сетапов — стандартная скорость и умеренный множитель.
                  Для атакующих сценариев — максимум скорости и урона.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-300">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Настройка под миссию
                </h3>
                <p className="mt-2">
                  Перед босс-файтами добавьте урон, а на миссиях сопровождения сохраняйте
                  стандартную скорость, чтобы тиммейты не убегали вперёд.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-300">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Экстренная помощь
                </h3>
                <p className="mt-2">
                  Включите режим &laquo;Очень быстро&raquo; и повышенный урон, когда нужно
                  стремительно зачистить волну врагов или удержать точку.
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
