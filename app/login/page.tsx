"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Eye, EyeOff, ArrowRight, Shield, Globe, Activity, Cpu } from "lucide-react";

const STATS = [
  { label: "Events Processed", value: "2.4M+", icon: Activity },
  { label: "Accounts Managed", value: "16", icon: Globe },
  { label: "AI Posts Generated", value: "48K+", icon: Cpu },
  { label: "Uptime", value: "99.9%", icon: Shield }
];

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep background */}
      <div className="absolute inset-0 bg-[#070B10]" />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52,211,153,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px"
        }}
      />

      {/* Radial glow — emerald left */}
      <div className="absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[120px]" />
      {/* Radial glow — blue right */}
      <div className="absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-[100px]" />
      {/* Radial glow — purple center top */}
      <div className="absolute left-1/2 -top-20 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-500/5 blur-[100px]" />

      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Floating data particles
function DataParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 4
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => usernameRef.current?.focus(), 800);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setStatus("loading");
    setErrorMsg("");

    // Use XMLHttpRequest with native username/password params targeting the protected route.
    // This caches the credentials for the exact realm used by /dashboard.
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/dashboard", true, username, password);

    xhr.onload = () => {
      if (xhr.status === 200) {
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else if (xhr.status === 401) {
        setStatus("error");
        setErrorMsg("Access denied. Invalid credentials — please double check your username and password.");
      } else {
        // No auth configured or server error — just proceed
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      }
    };

    xhr.onerror = () => {
      // Network error — proceed anyway (auth might not be configured)
      setStatus("success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    };

    xhr.send();
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      <GridBackground />
      {mounted && <DataParticles />}

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-5 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow-emerald">
            <Zap className="h-4 w-4 fill-black text-black" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-tight gradient-text-emerald">FOOTBALL INTELLIGENCE</p>
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">Command System v2.0</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Systems Nominal</span>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left — Hero copy */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col gap-8"
        >
          {/* Main heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Restricted Access</span>
            </div>

            <h1 className="text-6xl font-black tracking-tighter leading-none">
              <span className="block text-foreground/90">Football</span>
              <span className="block gradient-text-emerald">Intelligence</span>
              <span className="block text-foreground/40 text-4xl font-bold mt-1">Command Center</span>
            </h1>

            <p className="text-base text-muted-foreground/70 max-w-sm leading-relaxed">
              AI-powered football media automation. Collect intelligence, generate content, and publish to social media — all on autopilot.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-border/40 bg-white/[0.03] backdrop-blur-sm p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-2xl font-black gradient-text-emerald">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Terminal line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="rounded-xl border border-border/30 bg-black/40 backdrop-blur-sm px-4 py-3 font-mono text-xs text-emerald-400/70"
          >
            <span className="text-muted-foreground/40">$ </span>
            <span>pipeline.run --force --accounts=all</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="ml-1 inline-block h-3 w-1.5 bg-emerald-400/60 align-middle"
            />
          </motion.div>
        </motion.div>

        {/* Right — Login form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md mx-auto"
        >
          {/* Card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-emerald-500/10" />

            {/* Top emerald glow */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-glow-emerald"
                  >
                    <Zap className="h-8 w-8 text-emerald-400 fill-emerald-400" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">Access Granted</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Launching command center...</p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Header */}
                  <div className="mb-8 space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">Secure Login</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/40 to-transparent" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">
                      Commander Access
                    </h2>
                    <p className="text-sm text-muted-foreground/60">
                      Authenticate to enter the Football Intelligence Command Center.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Commander ID
                      </label>
                      <div className="relative">
                        <input
                          ref={usernameRef}
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                          autoComplete="username"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 focus:border-emerald-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)] focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Access Code
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 focus:border-emerald-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)] focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
                        >
                          <p className="text-xs font-medium text-red-400">{errorMsg}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={status === "loading" || !username}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-sm font-bold text-black shadow-glow-emerald transition-all duration-200 hover:shadow-[0_0_32px_rgba(52,211,153,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-glow-emerald"
                    >
                      {/* Shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {status === "loading" ? (
                          <>
                            <motion.div
                              className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            Launch Command Center
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </form>

                  {/* Footer */}
                  <div className="mt-6 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-muted-foreground/30" />
                      <p className="text-[10px] text-muted-foreground/40">
                        Secured with HTTP Basic Authentication
                      </p>
                    </div>
                    <Link
                      href="/about"
                      className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 relative z-50 cursor-pointer block p-2"
                    >
                      Know about this project →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-6 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/30 uppercase tracking-widest"
          >
            <span>Football Intelligence Platform</span>
            <span>·</span>
            <span>v2.0</span>
            <span>·</span>
            <span>Restricted</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom scan line decoration */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </div>
  );
}
