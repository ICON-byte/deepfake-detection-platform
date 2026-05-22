import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Image, Video, Music, Brain, Lock, Upload, Search, FileCheck,
  ChevronRight, ChevronDown, Eye,
} from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GradientButton } from "@/components/GradientButton";
import { GlassCard } from "@/components/GlassCard";

export const Route = createFileRoute("/")({ component: Index });

const features = [
  { icon: Image, title: "Image Deepfake Detection", desc: "Pixel-level analysis catches face swaps, GAN artifacts, and tampered metadata." },
  { icon: Video, title: "Video Deepfake Detection", desc: "Frame-by-frame neural inspection with temporal consistency scoring." },
  { icon: Music, title: "Audio Detection", desc: "Spectral fingerprinting identifies cloned voices and synthetic speech." },
  { icon: Brain, title: "AI-Powered Analysis", desc: "Ensemble of state-of-the-art models trained on millions of samples." },
  { icon: Lock, title: "Secure Scanning", desc: "Encrypted uploads, isolated processing, zero data retention by default." },
];

const steps = [
  { icon: Upload, title: "Upload Media", desc: "Drag-and-drop your image, video or audio file." },
  { icon: Search, title: "AI Scans Content", desc: "Our models inspect pixels, frames and spectrograms." },
  { icon: FileCheck, title: "Get a Report", desc: "Receive a verdict, confidence score and breakdown." },
];

const faqs = [
  { q: "What file types are supported?", a: "Images (JPG, PNG, WEBP), videos (MP4, MOV) and audio (MP3, WAV)." },
  { q: "How accurate is TruthLens AI?", a: "Our ensemble achieves over 99% accuracy on benchmark datasets, with full confidence scoring." },
  { q: "Is my uploaded media stored?", a: "By default, no. Media is processed in isolated containers and discarded after analysis." },
  { q: "Can I use it for journalism or law enforcement?", a: "Yes. TruthLens powers verification workflows for newsrooms, regulators, and security agencies." },
];

function Index() {
  return (
    <PageShell>
      {/* HERO - simplified, less flashy */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
              <span>NCS × Neo Cloud Technologies</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Detect AI-Manipulated <br />
              <span className="gradient-text">Media Instantly</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              TruthLens AI scans images, videos and audio for deepfake artifacts using a multi-model
              detection engine. Verify authenticity in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/detect" className="btn-primary">
                Analyze Media <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-outline">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Hero visual - simpler, static illustration */}
          <div className="relative mt-16 mx-auto max-w-2xl">
            <div className="glass-strong rounded-2xl p-6 border border-[#6699FF]/20">
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#6699FF]" />
                  <span className="text-sm">Image</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#6699FF]" />
                  <span className="text-sm">Video</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#6699FF]" />
                  <span className="text-sm">Audio</span>
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-gray-500">
                Upload any media file — get authenticity report in seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Detection across every <span className="gradient-text">media format</span>
          </h2>
          <p className="mt-3 text-gray-400">
            A unified detection engine for images, video and audio — engineered for speed, accuracy and trust.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
            >
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 
            className="text-3xl md:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            How It Works
          </h2>
          <p className="mt-3 text-gray-400">Three steps from upload to verdict.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="glass-card text-center">
              <div className="w-12 h-12 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Step {i + 1}</div>
              <h3 className="font-semibold text-lg text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h2 
          className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10 text-white"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => <FaqItem key={i} {...f} />)}
        </div>
      </section>

      {/* CTA - simplified */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="glass-strong rounded-2xl p-10 text-center border border-[#6699FF]/20">
          <Eye className="w-8 h-8 mx-auto mb-4 text-[#6699FF]" />
          <h2 
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Ready to verify the truth?
          </h2>
          <p className="mt-2 text-gray-400 max-w-md mx-auto">
            Upload your first file and see TruthLens AI in action.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link to="/detect" className="btn-primary">Start Detection</Link>
            <Link to="/register" className="btn-outline">Create Account</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card overflow-hidden p-0">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:text-[#6699FF] transition-colors"
      >
        <span className="font-medium text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#6699FF] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-4 text-sm text-gray-400">{a}</div>
      </motion.div>
    </div>
  );
}