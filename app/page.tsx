"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, BarChart3, Shield, Zap, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="animated-gradient min-h-screen overflow-hidden relative">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full bg-indigo-500/10"
          style={{
            width: `${20 + i * 15}px`,
            height: `${20 + i * 15}px`,
            left: `${10 + i * 15}%`,
            top: `${15 + i * 12}%`,
            animationDelay: `${i * 0.8}s`,
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Visit</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn-glow px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Powered by Real-Time Environmental Data</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            <span className="text-white">Urban</span>{" "}
            <span className="gradient-text">Intelligence</span>
            <br />
            <span className="text-white">for Smart Living</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Get real-time livability scores for any neighborhood in Hyderabad.
            Our Visit Score analyzes AQI, noise, infrastructure, and social
            factors to help you make smarter property decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-glow group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold"
            >
              <MapPin className="w-5 h-5" />
              Explore Map
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-white transition-all text-lg"
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
              color: "from-indigo-500 to-blue-500",
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Visit Score Algorithm",
              desc: "Proprietary scoring formula combining environmental, infrastructure, and social factors into a 0-100 score.",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "185 Lakes Monitored",
              desc: "Water quality data for all GHMC lakes — DO, pH, conductivity, and BOD levels tracked continuously.",
              color: "from-emerald-500 to-teal-500",
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
              className="glass-card p-8 hover:border-indigo-500/40 transition-all group cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {feat.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
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
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
