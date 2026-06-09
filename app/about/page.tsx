"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Zap, Shield, Cpu, Globe, Server, Database, Code, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      title: "Data Intelligence",
      description: "Aggregates football news, transfers, injuries, and match results from multiple premium APIs including GNews, The Guardian, and API-Football.",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "AI Generation",
      description: "Uses Groq's ultra-fast LLMs to analyze incoming events, score them for relevance, and craft engaging, persona-driven social media posts.",
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Automated Publishing",
      description: "Integrates seamlessly with Buffer to automatically schedule and publish the generated content across multiple social platforms simultaneously.",
      icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Robust Architecture",
      description: "Built on Next.js App Router, powered by Supabase for data persistence, and scheduled via Inngest or Vercel Cron for reliable background execution.",
      icon: Server,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  const stack = ["Next.js 15", "React 19", "Tailwind CSS", "Framer Motion", "Supabase", "Groq AI", "Buffer API", "TypeScript"];

  return (
    <div className="min-h-screen bg-[#070B10] text-foreground font-sans selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50 blur-[100px]" />
        <div className="absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 rounded-full border border-border/40 bg-white/[0.02] hover:bg-white/[0.06] backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Command Center
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 max-w-3xl mb-24"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Project Overview</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            <span className="text-foreground/90">Automating</span>{" "}
            <span className="gradient-text-emerald">Football Media</span>{" "}
            <span className="text-foreground/90">at Scale.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed max-w-2xl">
            This platform is a fully autonomous intelligence engine designed to operate modern football media brands. It monitors the football world 24/7, generates engaging content, and publishes it without human intervention.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-8"
          >
            Core Capabilities
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors"
              >
                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg} ${feature.border} border`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.02] p-8 md:p-12 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-6">
            <Code className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Built with Modern Tech</h2>
          <p className="text-muted-foreground/80 max-w-xl mx-auto mb-10">
            Engineered for performance, scalability, and an exceptional developer experience using industry-leading tools.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {stack.map((tech) => (
              <div 
                key={tech}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {tech}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Zap className="h-3 w-3 text-black fill-black" />
            </div>
            <span className="text-xs font-bold tracking-tight text-foreground/80">Football Intel Platform</span>
          </div>
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest">
            v2.0 Architecture
          </p>
        </div>

      </div>
    </div>
  );
}
