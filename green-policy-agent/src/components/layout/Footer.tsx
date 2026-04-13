import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const quickLinks = [
  { en: "Home", hi: "होम", href: "/" },
  { en: "Map Dashboard", hi: "मानचित्र डैशबोर्ड", href: "/dashboard" },
  { en: "Schemes", hi: "योजनाएं", href: "#schemes" },
  { en: "Reports", hi: "रिपोर्ट्स", href: "#reports" },
  { en: "Alerts", hi: "अलर्ट्स", href: "#alerts" },
  { en: "Contact", hi: "संपर्क", href: "#contact" },
];

const govLinks = [
  { name: "Ministry of Environment", href: "https://moef.gov.in" },
  { name: "National Green Tribunal", href: "https://greentribunal.gov.in" },
  { name: "ISRO Bhuvan Portal", href: "https://bhuvan.nrsc.gov.in" },
  { name: "Digital India Land Records", href: "https://dilrmp.gov.in" },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-[#1a1a2e] text-gray-300">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9933] via-white to-[#138808] flex items-center justify-center shadow">
                <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="#000080" strokeWidth="1.5" fill="none" />
                  <circle cx="20" cy="20" r="6" fill="#000080" />
                  <path d="M20 8 Q24 14 20 20 Q16 14 20 8Z" fill="#138808" opacity="0.8" />
                  <path d="M20 32 Q24 26 20 20 Q16 26 20 32Z" fill="#138808" opacity="0.6" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">DharaDrishti</h3>
                <p className="hindi-text text-[#FF9933] text-sm -mt-0.5">धरादृष्टि</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              India&apos;s Smart Environmental Policy Mapping Platform. Empowering citizens with transparent land data and environmental intelligence.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed hindi-text">
              भारत का स्मार्ट पर्यावरण नीति मानचित्रण मंच। पारदर्शी भूमि डेटा और पर्यावरणीय जानकारी के साथ नागरिकों को सशक्त बनाना।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links / <span className="hindi-text font-normal">त्वरित लिंक</span>
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.en}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF9933] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#138808] group-hover:bg-[#FF9933] transition-colors" />
                    {link.en}
                    <span className="hindi-text text-xs opacity-50">{link.hi}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Related Portals / <span className="hindi-text font-normal">संबंधित पोर्टल</span>
            </h4>
            <ul className="space-y-2.5">
              {govLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF9933] transition-colors group"
                  >
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact Us / <span className="hindi-text font-normal">संपर्क करें</span>
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#FF9933] mt-0.5 shrink-0" />
                <span>New Delhi, India — 110003</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#FF9933] shrink-0" />
                <span>+91-11-2436-0000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#FF9933] shrink-0" />
                <span>support@dharadrishti.gov.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            <strong>Disclaimer / अस्वीकरण:</strong> The information provided on this platform is for informational purposes only. 
            Land records and environmental data are sourced from publicly available government datasets and may not reflect the most current status. 
            Users are advised to verify information with local authorities before taking any action.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#0d0d1a] border-t border-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} DharaDrishti. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Powered by <span className="text-[#FF9933] font-semibold">DharaDrishti</span> | Built for India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
