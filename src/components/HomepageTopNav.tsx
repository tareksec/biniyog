import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function HomepageTopNav() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "কেন আমরা", href: "#why" },
    { name: "কীভাবে কাজ করে", href: "#how" },
    { name: "এক্সপার্ট", href: "#expert" },
    { name: "সুযোগসমূহ", href: "#opportunities" },
    { name: "ব্লগ", href: "/blog" },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/")) return; // Allow normal navigation for router links
    e.preventDefault();
    setIsOpen(false);
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pt-4 px-4 sm:px-6 flex justify-center pointer-events-none">
      <nav 
        className="pointer-events-auto relative w-full max-w-6xl rounded-full bg-[#0a3821] px-4 py-3 sm:px-6 flex items-center justify-between transition-all"
        style={{
          border: "2px solid rgba(255, 255, 255, 0.9)",
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.15)"
        }}
      >
        
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 outline-none">
            <span className="text-xl sm:text-2xl font-black font-display text-white drop-shadow-sm">
              বিনিয়োগ বৃদ্ধি
            </span>
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map((link) => link.href.startsWith("/") ? (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-semibold text-white/90 hover:text-white transition-all relative group py-1 outline-none"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8fb28f] transition-all group-hover:w-full rounded-full"></span>
            </Link>
          ) : (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-semibold text-white/90 hover:text-white transition-all relative group py-1 outline-none"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8fb28f] transition-all group-hover:w-full rounded-full"></span>
            </a>
          ))}
        </div>

        {/* Right: CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/opportunities"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-[#7a9d7a] px-5 text-sm font-bold text-white shadow-inner transition-all hover:bg-[#688a68] hover:shadow-md active:scale-[0.98] outline-none"
          >
            বিনিয়োগ শুরু করুন
          </Link>

          {/* Hamburger Menu Toggle (Mobile/Tablet) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-20 left-4 right-4 z-[55] mx-auto max-w-full rounded-3xl bg-[#0a3821] p-4 lg:hidden flex flex-col gap-2"
            style={{
              border: "2px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.15)"
            }}
          >
            {links.map((link) => link.href.startsWith("/") ? (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors text-center"
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="px-4 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors text-center"
              >
                {link.name}
              </a>
            ))}
            <div className="mt-2 pt-2 border-t border-white/20 sm:hidden">
              <Link
                to="/opportunities"
                onClick={() => setIsOpen(false)}
                className="flex w-full h-12 items-center justify-center rounded-2xl bg-[#7a9d7a] px-5 text-base font-bold text-white shadow-inner transition-all hover:bg-[#688a68] active:scale-[0.98]"
              >
                বিনিয়োগ শুরু করুন
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
