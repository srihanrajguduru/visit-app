"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, BarChart3, Shield, Zap, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="animated-gradient min-h-screen overflow-hidden relative">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            width: `${20 + i * 15}px`,
            height: `${20 + i * 15}px`,
            left: `${10 + i * 15}%`,
            top: `${15 + i * 12}%`,
            animationDelay: `${i * 0.8}s`,
            background: `rgba(43, 163, 212, ${0.06 + i * 0.02})`,
          }}
        />
      ))}

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
            }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Vi-SiT</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <ThemeToggle />
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors theme-transition"
            style={{ color: "var(--text-muted)" }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn-glow px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "var(--brand-primary)" }}
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
            style={{
              background: "rgba(43, 163, 212, 0.1)",
              border: "1px solid rgba(43, 163, 212, 0.2)",
              color: "var(--brand-accent)",
            }}
          >
            <Zap className="w-4 h-4" />
            <span>Powered by Real-Time Environmental Data</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            <span style={{ color: "var(--text-primary)" }}>Vision</span>{" "}
            <span className="gradient-text">for Your</span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>Next </span>
            <span className="gradient-text">Site</span>
          </h1>

          <p
            className="text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Get real-time livability scores for any neighborhood in Hyderabad.
            Our Visit Score analyzes AQI, noise, infrastructure, and social
            factors to help you make smarter property decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-glow group flex items-center gap-3 px-8 py-4 rounded-2xl text-white text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
              }}
            >
              <MapPin className="w-5 h-5" />
              Explore Map
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg transition-all theme-transition"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <BarChart3 className="w-5 h-5" />
              View Scores
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32"
        >
          {[
            {
              icon: <MapPin className="w-6 h-6" />,
              title: "Real-Time AQI & Noise",
              desc: "Live data from 12 Hyderabad monitoring stations including PM2.5, SO2, NOx, and decibel levels.",
              gradient: "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Visit Score Algorithm",
              desc: "Proprietary scoring formula combining environmental, infrastructure, and social factors into a 0-100 score.",
              gradient: "linear-gradient(135deg, var(--brand-accent), var(--brand-secondary))",
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "185 Lakes Monitored",
              desc: "Water quality data for all GHMC lakes — DO, pH, conductivity, and BOD levels tracked continuously.",
              gradient: "linear-gradient(135deg, var(--brand-secondary), #2BA3D4)",
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
              className="glass-card p-8 transition-all group cursor-default"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-white"
                style={{ background: feat.gradient }}
              >
                {feat.icon}
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {feat.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {[
            { value: "20+", label: "Monitored Areas" },
            { value: "12", label: "AQI Stations" },
            { value: "185", label: "Lakes Tracked" },
            { value: "Real-time", label: "Score Updates" },
          ].map((stat, i) => (
            <div key={i} className="text-center py-6">
              <div className="text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
