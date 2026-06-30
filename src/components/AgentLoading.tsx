import { Sparkles, Brain, Wand2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  { icon: Brain, label: "Pulling 30-day performance windows…" },
  { icon: Sparkles, label: "Scoring creative quality across 5 ads…" },
  { icon: Wand2, label: "Clustering device × time segments…" },
  { icon: CheckCircle2, label: "Generating new ad variants…" },
];

export function AgentLoading() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-3xl p-10 my-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative h-14 w-14 grid place-items-center rounded-2xl gradient-bg">
          <Brain className="h-7 w-7 text-white" />
          <div className="absolute inset-0 rounded-2xl gradient-bg blur-xl opacity-60 animate-pulse" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Multi-Agent Optimizer</div>
          <div className="text-2xl font-semibold gradient-text">Thinking…</div>
        </div>
        <div className="ml-auto flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              style={{ animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }}
            />
          ))}
        </div>
      </div>

      <ol className="space-y-3">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i < stage;
          const active = i === stage;
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
                active
                  ? "border-primary/50 bg-primary/10"
                  : done
                  ? "border-success/30 bg-success/5 opacity-70"
                  : "border-border/40 opacity-40"
              }`}
            >
              <Icon className={`h-5 w-5 ${done ? "text-success" : active ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm">{s.label}</span>
              {active && (
                <span className="ml-auto text-xs font-mono text-primary">running…</span>
              )}
              {done && <span className="ml-auto text-xs text-success">✓</span>}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full gradient-bg transition-all duration-500"
          style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
