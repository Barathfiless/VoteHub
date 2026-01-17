import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Vote, Shield, Users, BarChart3, Lock, ArrowRight, Zap, CheckCircle2, GraduationCap, Landmark, ScrollText } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* Official Top Bar - Slimmer & More Formal */}
      <div className="bg-[#0f172a] text-slate-400 text-[10px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/5 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium tracking-widest uppercase">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3 h-3 text-blue-400" />
              Official election commission authority
            </span>
          </div>
          <div className="flex gap-6 items-center">
            <span>Server: {new Date().toLocaleTimeString()} UTC</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
              Systems Secure
            </span>
          </div>
        </div>
      </div>

      {/* Navigation - Glassmorphism */}
      <nav className="sticky top-0 w-full bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">VOTE<span className="text-blue-500">HUB</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-0.5">University Governance</p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <a href="#notices" className="hover:text-blue-600 dark:hover:text-white transition-colors">Notices</a>
              <a href="#portals" className="hover:text-blue-600 dark:hover:text-white transition-colors">Portals</a>
              <a href="#compliance" className="hover:text-blue-600 dark:hover:text-white transition-colors">Standard</a>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="hidden sm:flex border-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-[11px] font-bold uppercase tracking-widest px-6 h-9 rounded-full transition-all"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern & Abstract */}
      <header className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="inline-block mb-10">
            <div className="flex items-center justify-center gap-3 px-5 py-2 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm shadow-inner">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em]">Verified Democratic Security</span>
            </div>
          </motion.div>

          <motion.h2
            initial="hidden" animate="visible" variants={fadeIn}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tight leading-[0.9]"
          >
            Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">Democracy</span>
          </motion.h2>

          <motion.p
            initial="hidden" animate="visible" variants={fadeIn}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-14 max-w-2xl mx-auto font-medium"
          >
            The official designated infrastructure for conducting transparent, secure, and university-grade election processes with absolute integrity.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button
              onClick={() => navigate('/auth')}
              className="min-w-[240px] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-blue-500/20 group"
            >
              Enter Student Portal
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest decoration-blue-500/30">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Identity Verified Access Only
            </div>
          </motion.div>
        </div>
      </header>

      {/* Stats Section - Floating Cards */}
      <section id="notices" className="relative -mt-20 px-4 sm:px-6 lg:px-8 z-20">
        <motion.div
          initial="hidden" whileInView="visible" variants={staggerContainer} viewport={{ once: true }}
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: "Platform Status", value: "Active Session", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/5" },
            { label: "Registered Voters", value: "12,450 Verified", icon: Users, color: "text-blue-500", bg: "bg-blue-500/5" },
            { label: "Filing Deadline", value: "23:59 EST Today", icon: ScrollText, color: "text-amber-500", bg: "bg-amber-500/5" },
            { label: "Security Protocol", value: "AES-256 Validated", icon: Lock, color: "text-indigo-500", bg: "bg-indigo-500/5" }
          ].map((stat, i) => (
            <motion.div
              key={i} variants={fadeIn}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:translate-y-[-4px] transition-all"
            >
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</h4>
              <p className="font-bold text-slate-900 dark:text-white text-base">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Access Portals - Premium Glassmorphism */}
      <section id="portals" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tighter">Authorized Terminals</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">Secure gateways to the university election ecosystem. Authentication requires validated institutional identity tokens.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="group relative"
          >
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 p-12 transition-all">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-8">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Primary Voter Bridge
                  </div>
                  <h4 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Student Voting <span className="text-blue-600">Terminal</span></h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                    Integrated environment for ballot visualization, secure submission, and real-time confirmation. Adheres to zero-knowledge proof standards for voter anonymity.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {[
                      "SSO Identity Integration",
                      "End-to-End Encryption",
                      "Immediate Ballot Receipt",
                      "Historical Participation Data"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate('/auth')}
                    className="w-full sm:w-auto h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl dark:shadow-blue-500/10"
                  >
                    Authenticate Now
                  </Button>
                </div>
                <div className="hidden lg:block relative shrink-0">
                  <div className="w-72 h-72 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center p-12 transform rotate-3 shadow-2xl shadow-blue-500/40 relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent)]"></div>
                    <GraduationCap className="w-full h-full text-white/90 transform -rotate-3" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-72 h-72 border-2 border-slate-200 dark:border-white/5 rounded-3xl -z-10 bg-slate-100 dark:bg-white/5"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compliance - Grid Layout */}
      <section id="compliance" className="py-32 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Governance & Audit</h3>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">System Compliance Standards</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">
                VoteHub infrastructure operates under strict mandate of the University Senate and International Electronic Voting Standards (VVSG 2.0). All cryptographic keys are rotated per session.
              </p>
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400 font-black hover:bg-blue-600/5 flex items-center gap-3 text-[11px] uppercase tracking-widest p-0 decoration-blue-500/50 underline-offset-4 hover:underline">
                Legal Framework Documentation <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
              {[
                { title: "Immutable Audit Trails", icon: ScrollText, text: "Every interaction is cryptographically hashed to an immutable log." },
                { title: "Identity Vault", icon: Lock, text: "Personal identity tokens are separated from cast ballots using blind signatures." },
                { title: "Real-time Verification", icon: BarChart3, text: "Live tallying infrastructure with post-election verification keys." },
                { title: "Threat Mitigation", icon: Shield, text: "Active defense against Sybil attacks and automated manipulation." }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 flex items-center justify-center rounded-xl mb-6 shadow-inner">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h5 className="font-black text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">{item.title}</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Sophisticated & Clean */}
      <footer className="bg-slate-950 text-slate-500 py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16 pb-16 border-b border-white/5">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <Landmark className="w-6 h-6 text-white/50" />
                <span className="font-black text-white text-lg tracking-tighter uppercase">VOTE<span className="text-blue-500">HUB</span></span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-600 leading-loose">
                Authorized University digital governance infrastructure for the next generation of academic leadership.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24">
              <div className="space-y-4">
                <h6 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6">Resources</h6>
                <a href="#" className="block text-xs hover:text-white transition-colors">Voter Guide</a>
                <a href="#" className="block text-xs hover:text-white transition-colors">Commission Bylaws</a>
                <a href="#" className="block text-xs hover:text-white transition-colors">Audit Reports</a>
              </div>
              <div className="space-y-4">
                <h6 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6">Transparency</h6>
                <a href="#" className="block text-xs hover:text-white transition-colors">Privacy</a>
                <a href="#" className="block text-xs hover:text-white transition-colors">Security Audit</a>
                <a href="#" className="block text-xs hover:text-white transition-colors">Accessibility</a>
              </div>
              <div className="space-y-4 col-span-2 sm:col-span-1">
                <h6 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6">Support</h6>
                <a href="#" className="block text-xs hover:text-white transition-colors font-bold underline decoration-blue-500">Contact IT Command</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
            <div>&copy; 2026 VoteHub Systems. Proprietary Governance Infrastructure.</div>
            <div className="flex gap-8">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Node_Region: US-EAST-1
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
