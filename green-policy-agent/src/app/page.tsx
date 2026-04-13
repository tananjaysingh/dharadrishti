"use client";

import { motion } from "framer-motion";
import {
  MapPin, Shield, AlertTriangle, FileText, BarChart3,
  ArrowRight, Search, Layers, Bell, ChevronRight, Clock,
  Factory, Landmark, Users, BookOpen
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ─── Data ─── */
const features = [
  {
    title: "Land Category Check",
    titleHi: "भूमि श्रेणी जांच",
    description: "Instantly verify land ownership type — Panchayat, Forest, Private, or State-owned — with official cadastral data.",
    icon: MapPin,
    color: "from-green-500 to-green-700",
    iconBg: "bg-green-100 text-green-700",
  },
  {
    title: "Environmental Risk Zones",
    titleHi: "पर्यावरण जोखिम क्षेत्र",
    description: "Identify eco-sensitive, flood-prone, and industrial waste areas with satellite-based environmental risk overlays.",
    icon: AlertTriangle,
    color: "from-red-500 to-orange-600",
    iconBg: "bg-red-100 text-red-700",
  },
  {
    title: "Protected Land Alerts",
    titleHi: "संरक्षित भूमि अलर्ट",
    description: "Get notified when land falls in Wildlife Sanctuary, National Park, or Tribal Belt protection zones.",
    icon: Shield,
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    title: "Government Policy Mapping",
    titleHi: "सरकारी नीति मानचित्रण",
    description: "Overlay active MOEF policies, NGT orders, and state-level environmental regulations on interactive maps.",
    icon: Landmark,
    color: "from-indigo-500 to-purple-600",
    iconBg: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Pollution Monitoring",
    titleHi: "प्रदूषण निगरानी",
    description: "Track air quality index, water contamination levels, and industrial emission data across districts.",
    icon: Factory,
    color: "from-yellow-500 to-amber-600",
    iconBg: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Real-Time Reports",
    titleHi: "रियल-टाइम रिपोर्ट्स",
    description: "Generate instant analytical reports on land status, encroachment alerts, and environmental impact assessments.",
    icon: BarChart3,
    color: "from-teal-500 to-cyan-600",
    iconBg: "bg-teal-100 text-teal-700",
  },
];

const stats = [
  { number: "12,500+", label: "Villages Covered", labelHi: "गांव कवर किए गए", icon: Users },
  { number: "850+", label: "Policies Tracked", labelHi: "नीतियां ट्रैक की गईं", icon: BookOpen },
  { number: "3,200+", label: "Risk Zones Identified", labelHi: "जोखिम क्षेत्र पहचाने गए", icon: AlertTriangle },
  { number: "28,000+", label: "Reports Generated", labelHi: "रिपोर्ट तैयार की गईं", icon: FileText },
];

const schemes = [
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    nameHi: "प्रधानमंत्री फसल बीमा योजना",
    dept: "Ministry of Agriculture",
    status: "Active",
    description: "Crop insurance scheme protecting farmers from natural calamities, pests, and diseases.",
  },
  {
    name: "National Green India Mission",
    nameHi: "राष्ट्रीय हरित भारत मिशन",
    dept: "Ministry of Environment",
    status: "Active",
    description: "Aims to increase forest cover and enhance ecosystem services like carbon sequestration.",
  },
  {
    name: "Compensatory Afforestation Fund",
    nameHi: "प्रतिपूरक वनीकरण कोष",
    dept: "CAMPA",
    status: "Active",
    description: "Funds for afforestation, regeneration of forest ecosystem, and wildlife protection.",
  },
  {
    name: "Jal Jeevan Mission",
    nameHi: "जल जीवन मिशन",
    dept: "Ministry of Jal Shakti",
    status: "Active",
    description: "Providing safe and adequate drinking water through household tap connections.",
  },
];

const alerts = [
  {
    type: "warning",
    title: "ECO-SENSITIVE ZONE NOTIFICATION",
    titleHi: "ईको-सेंसिटिव ज़ोन अधिसूचना",
    time: "2 hours ago",
    description: "New ESZ boundaries notified for Sariska Tiger Reserve buffer — 3 villages affected.",
  },
  {
    type: "danger",
    title: "POLLUTION ALERT — PALI DISTRICT",
    titleHi: "प्रदूषण अलर्ट — पाली जिला",
    time: "5 hours ago",
    description: "Industrial effluent levels exceed safe threshold near Bandi River. CPCB investigation ordered.",
  },
  {
    type: "info",
    title: "LAND RECORD DIGITIZATION UPDATE",
    titleHi: "भूमि रिकॉर्ड डिजिटलीकरण अपडेट",
    time: "1 day ago",
    description: "Jaipur district has completed 92% digitization of land records under DILRMP scheme.",
  },
  {
    type: "success",
    title: "GREEN CLEARANCE APPROVED",
    titleHi: "हरित मंजूरी स्वीकृत",
    time: "2 days ago",
    description: "Environmental clearance granted for renewable energy project — Barmer Solar Park Phase II.",
  },
];

const mapZones = [
  { label: "Safe Land / सुरक्षित", color: "bg-green-500", border: "border-green-500", desc: "Clear for use" },
  { label: "Risk Zone / जोखिम", color: "bg-red-500", border: "border-red-500", desc: "Env. hazard" },
  { label: "Disputed / विवादित", color: "bg-yellow-500", border: "border-yellow-500", desc: "Under review" },
  { label: "Protected / संरक्षित", color: "bg-blue-500", border: "border-blue-500", desc: "No-build zone" },
];

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* ═══════ HERO SECTION ═══════ */}
        <section className="relative overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-banner.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/90 via-[#0a1628]/75 to-[#0a1628]/50" />

          <div className="relative container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-white/90 font-medium">Live Platform</span>
                  <span className="text-sm text-white/50 hindi-text">| लाइव प्लेटफॉर्म</span>
                </div>
              </motion.div>

              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Protecting Land Rights
                <br />
                with <span className="text-[#FF9933]">Smart Mapping</span>
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl hindi-text text-[#FF9933]/80 font-semibold mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                स्मार्ट मैपिंग के साथ भूमि अधिकारों की सुरक्षा
              </motion.p>

              <motion.p
                className="text-base md:text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                DharaDrishti helps citizens understand land status, environmental risks,
                protected zones, and government policies — all through one interactive
                GIS dashboard.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link href="/dashboard" className="btn-govt-primary text-base py-3.5 px-8 rounded-xl group">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Map
                  <span className="hindi-text text-xs ml-2 opacity-75">मानचित्र देखें</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#reports" className="btn-govt-saffron text-base py-3.5 px-8 rounded-xl group">
                  <FileText className="w-5 h-5 mr-2" />
                  View Reports
                  <span className="hindi-text text-xs ml-2 opacity-75">रिपोर्ट देखें</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        {/* ═══════ STATISTICS SECTION ═══════ */}
        <section className="relative -mt-8 z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-[#138808]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#1a237e]">{stat.number}</h3>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</p>
                  <p className="text-xs hindi-text text-gray-400 mt-0.5">{stat.labelHi}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FEATURES SECTION ═══════ */}
        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            {/* Section header */}
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-green-100 text-[#138808] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                Platform Features / मंच की विशेषताएं
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Comprehensive Environmental Intelligence
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto hindi-text">
                व्यापक पर्यावरणीय जानकारी — भूमि डेटा, जोखिम विश्लेषण, और सरकारी नीतियों का एक स्थान पर विश्लेषण
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="govt-card p-7 rounded-xl hover:-translate-y-1 transition-all duration-300 group"
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm hindi-text text-[#FF9933] font-semibold mb-3">{feature.titleHi}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════ MAP PREVIEW SECTION ═══════ */}
        <section className="py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-blue-100 text-[#1a237e] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                Interactive Map / इंटरएक्टिव मानचित्र
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Explore Land Zones Across India
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                Color-coded zones help you quickly identify land status. Click zones for detailed reports.
              </p>
            </motion.div>

            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Map container */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-1">
                <div className="bg-white rounded-xl overflow-hidden">
                  {/* Map header bar */}
                  <div className="bg-[#1a237e] text-white px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5" />
                      <span className="font-semibold text-sm">DharaDrishti Map Viewer</span>
                      <span className="hindi-text text-xs opacity-60">| मानचित्र व्यूअर</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs opacity-80">Live Data</span>
                    </div>
                  </div>

                  {/* Map body */}
                  <div className="relative h-[400px] md:h-[480px] bg-[#e8f0e8]">
                    {/* Stylized terrain lines */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 900 480">
                      {/* Rivers */}
                      <path d="M0 200 Q150 180 300 220 Q450 260 600 200 Q750 140 900 180" fill="none" stroke="#90caf9" strokeWidth="3" opacity="0.6" />
                      <path d="M100 350 Q250 320 400 360 Q550 400 700 340 Q800 300 900 330" fill="none" stroke="#90caf9" strokeWidth="2" opacity="0.4" />

                      {/* State boundary lines */}
                      <path d="M200 0 Q220 120 180 240 Q160 360 200 480" fill="none" stroke="#999" strokeWidth="1" strokeDasharray="8 4" opacity="0.3" />
                      <path d="M600 0 Q580 120 620 240 Q640 360 600 480" fill="none" stroke="#999" strokeWidth="1" strokeDasharray="8 4" opacity="0.3" />

                      {/* Safe zones */}
                      <rect x="50" y="50" width="130" height="100" rx="8" fill="#138808" opacity="0.15" stroke="#138808" strokeWidth="2" />
                      <rect x="350" y="80" width="160" height="120" rx="8" fill="#138808" opacity="0.12" stroke="#138808" strokeWidth="2" />
                      <rect x="680" y="250" width="140" height="110" rx="8" fill="#138808" opacity="0.15" stroke="#138808" strokeWidth="2" />

                      {/* Risk zones */}
                      <rect x="240" y="280" width="120" height="100" rx="8" fill="#dc2626" opacity="0.15" stroke="#dc2626" strokeWidth="2" />
                      <rect x="700" y="60" width="100" height="80" rx="8" fill="#dc2626" opacity="0.12" stroke="#dc2626" strokeWidth="2" />

                      {/* Disputed zones */}
                      <rect x="500" y="300" width="140" height="90" rx="8" fill="#eab308" opacity="0.15" stroke="#eab308" strokeWidth="2" />

                      {/* Protected zones */}
                      <rect x="100" y="280" width="100" height="80" rx="8" fill="#2563eb" opacity="0.12" stroke="#2563eb" strokeWidth="2" />

                      {/* Road grid */}
                      <line x1="0" y1="240" x2="900" y2="240" stroke="#aaa" strokeWidth="0.5" opacity="0.2" />
                      <line x1="450" y1="0" x2="450" y2="480" stroke="#aaa" strokeWidth="0.5" opacity="0.2" />

                      {/* City markers */}
                      <circle cx="115" cy="100" r="5" fill="#138808" />
                      <circle cx="430" cy="140" r="5" fill="#138808" />
                      <circle cx="300" cy="330" r="5" fill="#dc2626" />
                      <circle cx="570" cy="345" r="5" fill="#eab308" />
                      <circle cx="750" cy="100" r="5" fill="#dc2626" />
                      <circle cx="150" cy="320" r="5" fill="#2563eb" />
                      <circle cx="750" cy="305" r="5" fill="#138808" />
                    </svg>

                    {/* Floating labels */}
                    <div className="absolute top-12 left-12 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md border border-green-200">
                      <span className="text-xs font-bold text-green-700">Jaipur — Safe Zone</span>
                    </div>
                    <div className="absolute top-16 right-24 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md border border-red-200">
                      <span className="text-xs font-bold text-red-700">Pali — Risk Area</span>
                    </div>
                    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md border border-yellow-200">
                      <span className="text-xs font-bold text-yellow-700">Barmer — Disputed</span>
                    </div>
                    <div className="absolute bottom-32 left-16 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md border border-blue-200">
                      <span className="text-xs font-bold text-blue-700">Udaipur — Protected</span>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Search className="w-4 h-4" />
                      <span>Filters:</span>
                    </div>
                    {["District / जिला", "Village / गांव", "Land Type / भूमि प्रकार", "Pollution Level / प्रदूषण स्तर"].map((filter) => (
                      <button
                        key={filter}
                        className="text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#138808] hover:text-[#138808] transition-colors shadow-sm"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                {mapZones.map((zone) => (
                  <div key={zone.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${zone.color}`} />
                    <span className="text-sm font-medium text-gray-600 hindi-text">{zone.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════ GOVERNMENT SCHEMES ═══════ */}
        <section id="schemes" className="py-20 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-orange-100 text-[#FF9933] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                Government Schemes / सरकारी योजनाएं
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Active Environmental & Land Schemes
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto hindi-text">
                भारत सरकार की सक्रिय पर्यावरण और भूमि योजनाओं की जानकारी
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {schemes.map((scheme, idx) => (
                <motion.div
                  key={idx}
                  className="govt-card p-6 rounded-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#138808] transition-colors">
                        {scheme.name}
                      </h3>
                      <p className="text-sm hindi-text text-[#FF9933] font-semibold mt-0.5">{scheme.nameHi}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 shrink-0">
                      {scheme.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#1a237e] mb-2">{scheme.dept}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{scheme.description}</p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-[#138808] group-hover:underline">
                    View Details <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════ ALERTS & NOTIFICATIONS ═══════ */}
        <section id="alerts" className="py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                <Bell className="w-3 h-3 inline mr-1 -mt-0.5" />
                Latest Alerts / नवीनतम अलर्ट
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Alerts & Notifications
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                Stay updated with real-time environmental alerts, policy notifications, and land record changes.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {alerts.map((alert, idx) => {
                const styles: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
                  warning: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-600", dot: "bg-yellow-500" },
                  danger: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", dot: "bg-red-500" },
                  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", dot: "bg-blue-500" },
                  success: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", dot: "bg-green-500" },
                };
                const s = styles[alert.type];
                return (
                  <motion.div
                    key={idx}
                    className={`alert-card ${s.bg} ${s.border} border hover:shadow-md cursor-pointer group`}
                    custom={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <div className={`w-3 h-3 rounded-full ${s.dot} mt-1 shrink-0 animate-pulse`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900">{alert.title}</h4>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {alert.time}
                        </span>
                      </div>
                      <p className="text-xs hindi-text text-[#FF9933] font-semibold mb-1">{alert.titleHi}</p>
                      <p className="text-sm text-gray-500">{alert.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════ CTA SECTION ═══════ */}
        <section className="relative py-20 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#138808] to-[#0a5204]" />
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready to Explore India&apos;s Land Data?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-4 hindi-text">
                भारत के भूमि डेटा का अन्वेषण शुरू करें
              </p>
              <p className="text-base text-white/60 max-w-2xl mx-auto mb-8">
                Access comprehensive land records, environmental risk assessments, and government policy mappings — all in one platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#138808] font-bold text-base py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all group"
                >
                  <MapPin className="w-5 h-5" />
                  Enter Dashboard / डैशबोर्ड खोलें
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 font-bold text-base py-3.5 px-8 rounded-xl hover:bg-white/20 transition-all"
                >
                  Contact Us / संपर्क करें
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
