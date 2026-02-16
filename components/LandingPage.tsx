import React from 'react';
import { PRICING } from '../constants';
import { ArrowRight, Clock, CheckCircle, BarChart2, Shield, Users, User, Download, Eye, Sparkles, Zap, ChevronRight, GraduationCap, BookOpen, Brain, Globe, TrendingUp, Star, ArrowUpRight, Check, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NewsSection } from './NewsSection';
import { ScrollAnimation } from './ScrollAnimation';

interface LandingPageProps {
  onSelectMode: (mode: 'TIMED' | 'PRACTICE') => void;
  onSignIn: () => void;
  onViewPrivacy: () => void;
  onViewTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode, onSignIn, onViewPrivacy, onViewTerms }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:!text-slate-200 min-h-screen overflow-x-hidden transition-colors duration-300 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50 animate-fade-in border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition duration-500 shadow-lg shadow-blue-500/30 shrink-0">
            <GraduationCap className="text-black" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">ExamHub</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Excellence Portal</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
          <a href="#news" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">News</a>
          <a href="#tutors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Institutions</a>
          <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={onSignIn}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black hover:bg-slate-800 dark:hover:bg-slate-100 px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20 text-sm"
          >
            Student Login
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl flex flex-col p-6 space-y-4 animate-slide-down md:hidden">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-slate-800">Features</a>
            <a href="#news" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-slate-800">News</a>
            <a href="#tutors" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-slate-800">Institutions</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-slate-800">Pricing</a>
            <button
              onClick={() => {
                onSignIn();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 mt-4"
            >
              Student Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-32 pb-24 md:pt-40 md:pb-32 max-w-7xl mx-auto relative overflow-visible">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse-soft"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column: Text & CTA */}
          <div className="order-1 space-y-8 relative z-10 text-center lg:text-left">
            <ScrollAnimation animation="fade-in">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/5 dark:bg-white/10 rounded-full cursor-default transition-transform hover:scale-105">
                <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                  <User size={14} weight="bold" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">50k+ Students</span>
                <span className="w-px h-4 bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 underline decoration-slate-300 underline-offset-4">Read Success Stories</span>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-up" delay={0.1}>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium text-slate-900 dark:text-white leading-[0.9] tracking-tight">
                Ace<span className="italic font-light text-slate-400">+</span> <br />
                Your Exams.
              </h1>
            </ScrollAnimation>

            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

            <ScrollAnimation animation="slide-up" delay={0.2}>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed mx-auto lg:mx-0">
                Master JAMB & WAEC with the world's most advanced AI-driven CBT engine.
                <br /><span className="text-slate-400 text-sm mt-2 block">Up to 50x Faster Learning Speed.</span>
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-4 mt-6">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" />
                </div>
                <div className="text-sm">
                  <div className="font-bold text-slate-900 dark:text-white">Loved the performance</div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <span className="flex text-yellow-500"><Star size={10} weight="fill" /><Star size={10} weight="fill" /><Star size={10} weight="fill" /><Star size={10} weight="fill" /><Star size={10} weight="fill" /></span> / 4.9 Rating
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-up" delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-6 pt-6 justify-center lg:justify-start items-center">
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-3 active:scale-95 min-w-[200px]"
                >
                  Start Learning</button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:gap-3 transition-all"
                >
                  Our Pricing <ArrowUpRight size={20} />
                </button>
              </div>
            </ScrollAnimation>
          </div>

          {/* Right Column: Visuals */}
          <div className="order-2 relative w-full lg:h-[600px] flex items-center justify-center perspective-1000 mt-12 lg:mt-0">
            <ScrollAnimation animation="scale-up" delay={0.2} className="relative w-full max-w-sm md:max-w-md lg:max-w-lg aspect-[4/5] lg:aspect-square">
              {/* Main Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] shadow-2xl rotate-3 transform transition-transform duration-1000 hover:rotate-0"></div>

              {/* Image Container */}
              <div className="absolute inset-4 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Student Learning"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Floating Glass UI Elements */}

              {/* Card 1: 98% Success Rate (Top Right) */}
              <div className="absolute top-4 -right-2 md:top-8 md:-right-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl animate-float delay-100 border border-white/20 flex flex-col items-center gap-2 group hover:scale-105 transition-transform z-20">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <TrendingUp className="text-black" size={16} weight="bold" />
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-black text-slate-800 dark:text-white leading-none">98%</div>
                  <div className="text-[8px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Success Rate</div>
                </div>
              </div>

              {/* Card 2: +45% Faster (Top Left) */}
              <div className="absolute top-12 -left-4 md:top-20 md:-left-10 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl animate-float delay-300 flex items-center gap-3 md:gap-4 border border-white/10 dark:border-slate-300 z-10 w-40 md:w-48">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-inner shrink-0">
                  <Zap className="text-black" size={16} fill="currentColor" />
                </div>
                <div>
                  <div className="text-[10px] md:text-xs font-bold opacity-80 uppercase">Avg. Speed</div>
                  <div className="text-sm md:text-lg font-black leading-tight">+45% Faster</div>
                </div>
              </div>

              {/* Card 3: Certified Past Questions (Bottom Left) */}
              <div className="absolute bottom-24 -left-2 md:bottom-32 md:-left-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 md:p-3 pr-4 md:pr-5 rounded-full shadow-lg animate-float delay-500 border border-white/30 flex items-center gap-2 md:gap-3 hover:bg-white dark:hover:bg-slate-900 transition-colors z-20">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <CheckCircle size={14} weight="bold" />
                </div>
                <div className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Certified Past Questions</div>
              </div>

              {/* Card 4: 24/7 Access (Bottom Right) */}
              <div className="absolute bottom-8 -right-2 md:bottom-10 md:-right-4 bg-gradient-to-br from-indigo-600 to-blue-600 p-3 md:p-4 rounded-[1rem] md:rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 animate-float delay-700 border border-white/20 text-white z-20 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Globe size={14} />
                  </div>
                  <span className="font-black text-lg md:text-xl">24/7</span>
                </div>
                <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-indigo-100">Access Anywhere</div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </header>

      {/* News Section */}
      <div id="news">
        <ScrollAnimation animation="slide-up">
          <NewsSection />
        </ScrollAnimation>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollAnimation animation="slide-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Built for Serious Students</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400">Everything you need to crush your exams, from detailed analytics to realistic simulations.</p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "Timed Simulation", desc: "Practice under real exam conditions with strict timing to build speed and accuracy." },
              { icon: Brain, title: "Smart Analytics", desc: "Our AI identifies your weak topics and recommends targeted study materials." },
              { icon: Download, title: "Offline Access", desc: "Download study guides and practice questions to learn on the go, anytime." }
            ].map((feature, i) => (
              <ScrollAnimation key={i} animation="slide-up" delay={i * 0.1}>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:-translate-y-1 h-full">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Tutor Section */}
      <section id="tutors" className="py-32 bg-slate-900 dark:bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <ScrollAnimation animation="slide-up">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/10 text-blue-300 rounded-2xl text-xs font-black uppercase tracking-widest">
                  <Users size={16} /> For Schools & Tutors
                </div>
              </ScrollAnimation>

              <ScrollAnimation animation="slide-up" delay={0.1}>
                <h2 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tighter">Empower Your Classroom With Data.</h2>
              </ScrollAnimation>

              <ScrollAnimation animation="slide-up" delay={0.2}>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  Centralize your student data. Track readiness across entire classes and push personalized assignments based on our proprietary weak-area mapping.
                </p>
              </ScrollAnimation>

              <ul className="space-y-6">
                {[
                  { icon: Download, text: 'One-click bulk student registration via Excel', color: 'text-blue-400' },
                  { icon: Eye, text: 'Real-time monitoring of readiness scores', color: 'text-emerald-400' },
                  { icon: BarChart2, text: 'Aggregated class-wide weakness heatmap', color: 'text-red-400' }
                ].map((item, i) => (
                  <ScrollAnimation key={i} animation="slide-up" delay={0.3 + (i * 0.1)}>
                    <li className="flex items-center gap-5 group cursor-default">
                      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10 ${item.color}`}>
                        <item.icon size={22} />
                      </div>
                      <span className="font-bold text-slate-200 text-lg transition-colors group-hover:text-white">{item.text}</span>
                    </li>
                  </ScrollAnimation>
                ))}
              </ul>

              <ScrollAnimation animation="slide-up" delay={0.6}>
                <button
                  onClick={onSignIn}
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 w-fit"
                >
                  Create Institution Account <ChevronRight size={20} />
                </button>
              </ScrollAnimation>
            </div>

            <ScrollAnimation animation="scale-up" delay={0.2}>
              <div className="relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-800/50 dark:bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transform transition-transform duration-500 hover:rotate-y-2">
                  {/* Mock Dashboard UI */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <BarChart2 size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Class Performance</div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest">SS3 Gold • Mathematics</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">78%</div>
                      <div className="text-xs text-green-400 font-bold flex items-center justify-end gap-1"><TrendingUp size={12} /> +12%</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Calculus', val: 88, color: 'bg-emerald-500' },
                      { label: 'Algebra', val: 65, color: 'bg-yellow-500' },
                      { label: 'Geometry', val: 45, color: 'bg-red-500' },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                          <span>{stat.label}</span>
                          <span>{stat.val}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color}`} style={{ width: `${stat.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-blue-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-8">
          <ScrollAnimation animation="slide-up">
            <div className="text-center mb-20 space-y-4">
              <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-widest">Pricing Plans</div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Invest In Your Success</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">Affordable options for every student. Choose the plan that fits your study style.</p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <ScrollAnimation animation="slide-up" delay={0.1} className="h-full">
              <div className="group bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Timed Session</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Authentic exam environment with strict timing and official grading markers.</p>
                  <div className="flex items-baseline gap-2 mb-10">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">₦{PRICING.TIMED.toLocaleString()}</span>
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">/ exam</span>
                  </div>
                  <button
                    onClick={() => onSelectMode('TIMED')}
                    className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
                  >
                    Start Simulation
                  </button>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-up" delay={0.2} className="h-full">
              <div className="group bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-2xl relative overflow-hidden text-white h-full flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    <Zap size={32} fill="currentColor" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Smart Practice</h3>
                  <p className="text-slate-400 font-medium mb-8">Adaptive learning with instant feedback, explanations, and topic drill-downs.</p>
                  <div className="flex items-baseline gap-2 mb-10">
                    <span className="text-5xl font-black text-white">₦{PRICING.PRACTICE.toLocaleString()}</span>
                    <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">/ session</span>
                  </div>
                  <button
                    onClick={() => onSelectMode('PRACTICE')}
                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/30"
                  >
                    Start Smart Hub
                  </button>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-600 py-16 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center space-x-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition duration-500">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-white tracking-tighter uppercase">Exam Hub</span>
          </div>
          <p className="font-bold text-sm tracking-wide">© {new Date().getFullYear()} Exam Hub. Excellence in CBT Infrastructure.</p>
          <div className="flex gap-8 text-sm font-bold">
            <button onClick={onViewPrivacy} className="hover:text-white transition">Privacy</button>
            <button onClick={onViewTerms} className="hover:text-white transition">Terms</button>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

