import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Target, Users, Cpu } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({ component: AboutPage });

const aboutCards = [
  { icon: Target, title: "Our Mission", desc: "Restore trust in digital media by making deepfake detection accessible, fast, and accurate." },
  { icon: Cpu, title: "Our Technology", desc: "Ensemble of CNN, transformer, and audio-spectral models — continually trained on emerging threats." },
  { icon: Shield, title: "Built for Security", desc: "End-to-end encryption, isolated GPU sandboxes, and configurable zero-retention policies." },
  { icon: Users, title: "Our Partners", desc: "Newsrooms, electoral commissions, and financial institutions across Africa and beyond." },
];

function AboutPage() {
  return (
    <PageShell>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
          <span>About TruthLens AI × Neo Cloud Technologies</span>
        </div>
        <h1 
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Protecting media truth in the <span className="gradient-text">age of AI</span>
        </h1>
        <p className="mt-5 text-lg text-gray-300 max-w-2xl">
          TruthLens AI is a cybersecurity research initiative built for the Nigeria Computer Society
          (NCS) by Neo Cloud Technologies. We give journalists, regulators, and citizens the tools
          to verify whether media has been synthetically generated or manipulated.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-5 md:grid-cols-2">
        {aboutCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card"
          >
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-1">{card.title}</h3>
            <p className="text-sm text-gray-400">{card.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-strong rounded-2xl p-10 text-center border border-[#6699FF]/20">
          <h2 
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Try TruthLens AI today
          </h2>
          <p className="mt-2 text-gray-400">No setup. Upload and verify in seconds.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link to="/detect" className="btn-primary">Analyze Media</Link>
            <Link to="/register" className="btn-outline">Get Started</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}