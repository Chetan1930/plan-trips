import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, MessageSquare, CheckSquare, ArrowRight, Plane, CreditCard, ChevronDown, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import heroImg from '@/assets/hero-travel.jpg';
import featureCollaborate from '@/assets/feature-collaborate.jpg';
import featureItinerary from '@/assets/feature-itinerary.jpg';
import featureChat from '@/assets/feature-chat.jpg';
import featureExplore from '@/assets/feature-explore.jpg';

const howItWorks = [
  {
    image: featureItinerary,
    title: 'Create your trip.',
    desc: 'Set your destination, dates, and budget. We\'ll set up everything you need — itinerary, expenses, checklists — in one place.',
  },
  {
    image: featureCollaborate,
    title: 'Plan with your crew.',
    desc: 'Invite friends and family by email. Everyone can add activities, split expenses, and check off packing lists together.',
  },
  {
    image: featureChat,
    title: 'Chat & decide together.',
    desc: 'Real-time group chat with file sharing. Discuss plans, share photos, and make decisions without endless WhatsApp threads.',
  },
  {
    image: featureExplore,
    title: 'Go explore.',
    desc: 'Everything organized in one place. Access your itinerary, track expenses in ₹, and check off your lists on the go.',
  },
];

const features = [
  { icon: Calendar, title: 'Smart Itinerary', desc: 'Day-by-day planning with times, locations, and easy reordering.' },
  { icon: Users, title: 'Group Collaboration', desc: 'Every member can add activities, expenses, and checklist items.' },
  { icon: MessageSquare, title: 'Trip Group Chat', desc: 'Real-time messaging with file and image sharing built in.' },
  { icon: CheckSquare, title: 'Checklists & Packing', desc: 'Assign items to members and track what\'s done.' },
  { icon: CreditCard, title: 'Expense Tracking (₹)', desc: 'Track who paid what. Indian rupee formatting with lakhs.' },
  { icon: Plane, title: 'Trip Invitations', desc: 'Invite via email. They see the trip on their dashboard instantly.' },
];

const stats = [
  { value: '100%', label: 'Free to use' },
  { value: '∞', label: 'Trips & Members' },
  { value: '₹', label: 'Indian Rupee' },
  { value: '⚡', label: 'Real-time sync' },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar - transparent over hero */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-background" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">Wandr.</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth" className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity hidden sm:block">
              Log in
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2.5 text-sm font-semibold bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Mindtrip inspired with warm amber background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Warm amber/gold background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(40,95%,55%)] via-[hsl(35,90%,50%)] to-[hsl(30,85%,45%)]" />

        {/* Hero travel image with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src={heroImg}
            alt="World landmarks - London, Paris, Rome"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
          />
        </motion.div>

        {/* Decorative floating clouds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[5%] w-40 h-24 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-[30%] right-[10%] w-56 h-32 bg-white/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[20%] left-[15%] w-48 h-28 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16 w-full">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-foreground"
            >
              Travel<br />better.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-foreground/80 max-w-md leading-relaxed"
            >
              Wandr brings your travel group together and empowers you to plan trips <strong>your way</strong>.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold bg-foreground text-background rounded-full hover:scale-105 transition-transform shadow-xl"
              >
                Start planning <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/60 z-10"
        >
          <span className="text-xs font-medium tracking-wide">Learn more</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="bg-foreground text-background py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black">{s.value}</p>
              <p className="text-xs sm:text-sm opacity-70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-center tracking-tight"
          >
            How it Works
          </motion.h2>

          <div className="mt-16 space-y-12 sm:space-y-16">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}
              >
                <div className="flex-1 w-full">
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-foreground/10">
                    <img
                      src={item.image}
                      alt={item.title}
                      width={1200}
                      height={800}
                      loading="lazy"
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[hsl(40,95%,55%)] text-foreground font-black text-lg mb-4">
                    {i + 1}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Everything you need</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              From brainstorming to boarding — Wandr covers every step of your trip.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08 }}
                className="group p-7 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[hsl(40,95%,55%)]/20 flex items-center justify-center mb-5 group-hover:bg-[hsl(40,95%,55%)]/30 transition-colors">
                  <f.icon className="w-6 h-6 text-[hsl(30,85%,40%)]" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social proof */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-[hsl(40,95%,55%)] text-[hsl(40,95%,55%)]" />
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
            "Finally an app where my whole travel group can plan together without chaos. The expense splitting in rupees is a game changer!"
          </blockquote>
          <p className="mt-6 text-muted-foreground">— Happy Wandr user</p>
        </div>
      </section>

      {/* CTA Section — warm amber */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(40,95%,55%)] via-[hsl(35,90%,50%)] to-[hsl(30,85%,45%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground"
          >
            Ready for your<br />next adventure?
          </motion.h2>
          <p className="mt-5 text-lg text-foreground/80 max-w-lg mx-auto">
            Sign up for free and start collaborating with your travel group in minutes.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-foreground text-background rounded-full hover:scale-105 transition-transform shadow-xl"
          >
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                <MapPin className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">Wandr.</span>
            </div>
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} Wandr. Built with ❤️ for travelers.
            </p>
            <a
              href="https://linkedin.com/in/chetan71"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              Contact Developer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
