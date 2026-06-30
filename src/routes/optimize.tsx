import "@/lib/fonts";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { campaigns } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentLoading } from "@/components/AgentLoading";
import { CreativeAnalyzer } from "@/components/CreativeAnalyzer";
import { PerformanceStats } from "@/components/PerformanceStats";
import { AutomationActions } from "@/components/AutomationActions";
import { ArrowLeft, Sparkles, Zap, Eye, Target, Megaphone } from "lucide-react";

const searchSchema = z.object({
  id: z.string().default(""),
  focus: z.enum(["awareness", "conversion", "traffic"]).default("conversion"),
});

export const Route = createFileRoute("/optimize")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Optimization Report — AdPilot" },
      { name: "description", content: "Multi-agent optimization report for your campaign." },
    ],
  }),
  component: OptimizePage,
});

const focusMeta = {
  awareness: { icon: Eye, label: "Awareness" },
  conversion: { icon: Target, label: "Conversion" },
  traffic: { icon: Megaphone, label: "Traffic" },
} as const;

function OptimizePage() {
  const { id, focus } = Route.useSearch();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const FocusIcon = focusMeta[focus].icon;

  const [done, setDone] = useState(false);

  // kick off the thinking phase
  useState(() => {
    setTimeout(() => setDone(true), 3000);
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-bg grid place-items-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-lg leading-tight">AdPilot</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Optimization Report</div>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to campaigns
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <section className="glass rounded-3xl p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Campaign</div>
              <h1 className="text-3xl font-semibold">
                {campaign.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-3 text-sm text-muted-foreground">
                <span className="font-mono text-primary">{campaign.id}</span>
                <span>·</span>
                <span>{campaign.channel}</span>
                <span>·</span>
                <span>${campaign.budget.toLocaleString()} budget</span>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              <FocusIcon className="h-3 w-3 mr-1" />
              Focus: {focusMeta[focus].label}
            </Badge>
          </div>
        </section>

        {!done && <AgentLoading />}

        {done && (
          <Tabs defaultValue="agent1" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-card border border-border">
              <TabsTrigger value="agent1" className="flex-col gap-1 py-3 data-[state=active]:gradient-bg data-[state=active]:text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Agent 1</span>
                </div>
                <span className="text-xs opacity-80">Creative Analyzer</span>
              </TabsTrigger>
              <TabsTrigger value="agent2" className="flex-col gap-1 py-3 data-[state=active]:gradient-bg data-[state=active]:text-white">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-semibold">Agent 2</span>
                </div>
                <span className="text-xs opacity-80">Performance Stats</span>
              </TabsTrigger>
              <TabsTrigger value="agent3" className="flex-col gap-1 py-3 data-[state=active]:gradient-bg data-[state=active]:text-white">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">Agent 3</span>
                </div>
                <span className="text-xs opacity-80">Automation &amp; Generation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agent1"><CreativeAnalyzer /></TabsContent>
            <TabsContent value="agent2"><PerformanceStats /></TabsContent>
            <TabsContent value="agent3"><AutomationActions /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
