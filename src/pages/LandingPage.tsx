import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, MessageSquare, CheckSquare, ArrowRight, Globe, Shield, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

const features = [
  { icon: Calendar, title: 'Smart Itinerary', desc: 'Plan day-by-day activities with times, locations, and drag-to-reorder.' },
  { icon: Users, title: 'Collaborate', desc: 'Invite friends by email. Everyone can add expenses, checklists & more.' },
  { icon: MessageSquare, title: 'Group Chat', desc: 'Discuss plans in real-time with file sharing and media support.' },
  { icon: CheckSquare, title: 'Checklists & Packing', desc: 'Never forget essentials. Assign items to members and track progress.' },
  { icon: Globe, title: 'Expense Splitting', desc: 'Track who paid what. Auto-split costs among all trip members.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your trip data is encrypted and only visible to invited members.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Wandr</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Zap className="w-3 h-3" /> Plan trips together, effortlessly
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Plan your next
              <span className="text-primary"> adventure </span>
              with your crew
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Wandr brings your travel group together. Build itineraries, split expenses,
              share checklists, and chat — all in one beautiful app.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Start Planning <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
              >
                See Features
              </a>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="h-8 bg-muted border-b border-border flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-wandr-orange/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              </div>
              <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Trips Created', value: '∞', color: 'text-primary' },
                  { label: 'Members', value: 'Unlimited', color: 'text-wandr-blue' },
                  { label: 'Chat Messages', value: 'Real-time', color: 'text-wandr-purple' },
                  { label: 'Expense Tracking', value: '₹ INR', color: 'text-wandr-orange' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to plan a trip</h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
              From brainstorming to boarding — Wandr covers every step.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to plan your next trip?</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Sign up for free and start collaborating with your travel group in minutes.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <MapPin className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Wandr</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Wandr. Built with ❤️ for travelers.
          </p>
          <a
            href="https://linkedin.com/in/chetan71"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact Developer
          </a>
        </div>
      </footer>
    </div>
  );
}
