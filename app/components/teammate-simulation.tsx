"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SPEED_MULTIPLIERS, type SpeedSetting } from "@/lib/settings";

type Unit = {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  maxHealth: number;
  health: number;
};

type SimulationState = {
  bots: Unit[];
  enemies: Unit[];
  totalDamage: number;
  enemiesDefeated: number;
  elapsedMs: number;
  nextEnemyId: number;
};

type SettingsSnapshot = {
  damageMultiplier: number;
  speedMultiplier: number;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;
const BASE_BOT_SPEED = 110; // px per second
const ATTACK_RANGE = 34; // px
const BASE_DAMAGE_PER_SECOND = 22;
const STAT_REFRESH_INTERVAL = 180; // ms

const BOT_COLORS = ["#38bdf8", "#a855f7", "#34d399", "#facc15"];

const RANDOM_TERRAIN_SPOTS = [
  { x: 120, y: 110, size: 70 },
  { x: 560, y: 80, size: 90 },
  { x: 220, y: 300, size: 65 },
  { x: 640, y: 300, size: 55 },
];

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function spawnEnemy(nextId: number): Unit {
  return {
    id: nextId,
    x: randomInRange(CANVAS_WIDTH * 0.55, CANVAS_WIDTH * 0.92),
    y: randomInRange(CANVAS_HEIGHT * 0.1, CANVAS_HEIGHT * 0.9),
    radius: 18,
    color: "#f87171",
    maxHealth: randomInRange(120, 170),
    health: 0, // overridden below
  };
}

function primeEnemy(enemy: Unit): Unit {
  return {
    ...enemy,
    health: enemy.maxHealth,
  };
}

function createInitialState(): SimulationState {
  const bots: Unit[] = Array.from({ length: 4 }, (_, index) => ({
    id: index,
    x: CANVAS_WIDTH * 0.18,
    y:
      CANVAS_HEIGHT * 0.22 +
      index * (CANVAS_HEIGHT * 0.18) +
      randomInRange(-18, 18),
    radius: 16,
    color: BOT_COLORS[index % BOT_COLORS.length],
    maxHealth: 150,
    health: 150,
  }));

  const enemiesRaw = Array.from({ length: 4 }, (_, index) =>
    spawnEnemy(100 + index),
  );

  return {
    bots,
    enemies: enemiesRaw.map((enemy) => primeEnemy(enemy)),
    totalDamage: 0,
    enemiesDefeated: 0,
    elapsedMs: 0,
    nextEnemyId: 100 + enemiesRaw.length,
  };
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#111827");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  RANDOM_TERRAIN_SPOTS.forEach((spot) => {
    const innerGradient = ctx.createRadialGradient(
      spot.x,
      spot.y,
      spot.size * 0.1,
      spot.x,
      spot.y,
      spot.size,
    );
    innerGradient.addColorStop(0, "rgba(30, 64, 175, 0.4)");
    innerGradient.addColorStop(1, "rgba(30, 64, 175, 0)");

    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= CANVAS_WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
}

function drawUnit(ctx: CanvasRenderingContext2D, unit: Unit, isBot: boolean) {
  ctx.beginPath();
  ctx.fillStyle = unit.color;
  ctx.shadowColor = unit.color;
  ctx.shadowBlur = isBot ? 18 : 12;
  ctx.arc(unit.x, unit.y, unit.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Health bar
  const barWidth = unit.radius * 2.6;
  const barHeight = 6;
  const barX = unit.x - barWidth / 2;
  const barY = unit.y - unit.radius - 12;

  ctx.fillStyle = "rgba(17, 24, 39, 0.6)";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  const healthRatio = Math.max(unit.health, 0) / unit.maxHealth;
  ctx.fillStyle = isBot ? "#34d399" : "#f97316";
  ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function TeammateSimulation({
  damageMultiplier,
  speedSetting,
}: {
  damageMultiplier: number;
  speedSetting: SpeedSetting;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settingsRef = useRef<SettingsSnapshot>({
    damageMultiplier,
    speedMultiplier: SPEED_MULTIPLIERS[speedSetting],
  });
  const stateRef = useRef<SimulationState>(createInitialState());
  const [stats, setStats] = useState(() => ({
    totalDamage: 0,
    enemiesDefeated: 0,
    elapsedSeconds: 0,
  }));

  useEffect(() => {
    settingsRef.current = {
      damageMultiplier,
      speedMultiplier: SPEED_MULTIPLIERS[speedSetting],
    };
  }, [damageMultiplier, speedSetting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationFrame: number;
    let lastStatUpdate = performance.now();
    let lastTimestamp = performance.now();

    const step = () => {
      const now = performance.now();
      const deltaMs = now - lastTimestamp;
      lastTimestamp = now;
      const deltaSeconds = deltaMs / 1000;

      const settings = settingsRef.current;
      const state = stateRef.current;

      state.elapsedMs += deltaMs;

      // Update bots
      state.bots.forEach((bot) => {
        // Acquire target
        const livingEnemies = state.enemies.filter((enemy) => enemy.health > 0);
        if (livingEnemies.length === 0) {
          return;
        }

        let closest = livingEnemies[0];
        let closestDistance = Infinity;
        for (const enemy of livingEnemies) {
          const dx = enemy.x - bot.x;
          const dy = enemy.y - bot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = enemy;
          }
        }

        const dx = closest.x - bot.x;
        const dy = closest.y - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = BASE_BOT_SPEED * settings.speedMultiplier;
        if (distance > ATTACK_RANGE * 0.65) {
          const moveDistance = Math.min(speed * deltaSeconds, distance);
          const nx = dx / (distance || 1);
          const ny = dy / (distance || 1);
          bot.x = clamp(bot.x + nx * moveDistance, bot.radius, CANVAS_WIDTH - bot.radius);
          bot.y = clamp(bot.y + ny * moveDistance, bot.radius, CANVAS_HEIGHT - bot.radius);
        }

        // Attack phase
        if (distance <= ATTACK_RANGE) {
          const damage = BASE_DAMAGE_PER_SECOND * deltaSeconds * settings.damageMultiplier;
          closest.health -= damage;
          state.totalDamage += damage;

          if (closest.health <= 0) {
            state.enemiesDefeated += 1;
          }
        }
      });

      // Respawn defeated enemies
      state.enemies = state.enemies.map((enemy) => {
        if (enemy.health > 0) {
          return enemy;
        }

        const respawned = primeEnemy(
          spawnEnemy(state.nextEnemyId++),
        );
        return {
          ...respawned,
          x: randomInRange(CANVAS_WIDTH * 0.45, CANVAS_WIDTH * 0.9),
        };
      });

      // Drawing
      drawBackground(ctx);

      state.enemies.forEach((enemy) => {
        drawUnit(ctx, enemy, false);
      });
      state.bots.forEach((bot) => {
        drawUnit(ctx, bot, true);
      });

      if (now - lastStatUpdate >= STAT_REFRESH_INTERVAL) {
        lastStatUpdate = now;
        setStats({
          totalDamage: state.totalDamage,
          enemiesDefeated: state.enemiesDefeated,
          elapsedSeconds: state.elapsedMs / 1000,
        });
      }

      animationFrame = requestAnimationFrame(step);
    };

    drawBackground(ctx);
    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const aggregatedStats = useMemo(() => {
    return [
      {
        label: "Нанесённый урон",
        value: `${Math.round(stats.totalDamage).toLocaleString("ru-RU")} HP`,
        accent: "text-emerald-400",
      },
      {
        label: "Врагов выведено из строя",
        value: stats.enemiesDefeated.toString(),
        accent: "text-sky-400",
      },
      {
        label: "Время симуляции",
        value: `${stats.elapsedSeconds.toFixed(1)} c`,
        accent: "text-fuchsia-400",
      },
    ];
  }, [stats]);

  return (
    <section className="space-y-6 rounded-3xl border border-zinc-200 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl shadow-slate-950/40 dark:border-zinc-800">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Боевой симулятор Skyline</h2>
          <p className="text-sm text-slate-300">
            Наблюдайте за тиммейтами SmartTeammates в действии: они адаптируются к
            настройкам модификации в реальном времени.
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 ring-1 ring-white/15">
          Умные тиммейты · автор Skyline
        </div>
      </header>

      <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-inner shadow-black/40 ring-1 ring-white/5">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-[320px] w-full rounded-xl border border-white/5 bg-slate-950 object-cover shadow-lg shadow-black/40 sm:h-[420px]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/5" />
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        {aggregatedStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-lg shadow-black/30"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {stat.label}
            </dt>
            <dd className={`mt-2 text-xl font-bold ${stat.accent}`}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
