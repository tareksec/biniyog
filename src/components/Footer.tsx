import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, Briefcase } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-[#000A0B] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-28 sm:pt-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & About */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="বিনিয়োগ বৃদ্ধি" className="h-10 sm:h-12 w-auto rounded-xl" />
              </Link>
            </div>
            <p className="text-white/70 text-[15px] leading-relaxed">
              আমরা একটি স্বচ্ছ বিনিয়োগ প্লাটফর্ম। 
              <br />
              আমাদের সাথে যুক্ত হয়ে আপনার বিনিয়োগ স্বপ্ন পূরণ করুন এবং ব্যবসা ঝুঁকি গ্রহণ করে আর্থিক স্বাবলম্বী হবার যাত্রা শুরু করুন
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/mohaimin1" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#051F20] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#051F20] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/mohaimin-patwary-cfa-a8416aab/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#051F20] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/mohaiminpatwary" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#051F20] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 font-display">কুইক লিংকস</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  হোমপেজ
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  সুযোগসমূহ
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  ড্যাশবোর্ড
                </Link>
              </li>
              <li>
                <a href="/#how" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  কিভাবে কাজ করে
                </a>
              </li>
              <li>
                <a href="/#policy" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  আমাদের নীতিমালা
                </a>
              </li>
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 font-display">সাপোর্ট ও লিগ্যাল</h3>
            <ul className="space-y-4">
              <li>
                <a href="/#faq" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  সাধারণ জিজ্ঞাসা (FAQ)
                </a>
              </li>

              <li>
                <a href="/#policy" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  শর্তাবলী (Terms)
                </a>
              </li>
              <li>
                <a href="/#policy" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8EB69B]"></span>
                  গোপনীয়তা নীতি (Privacy)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 font-display">যোগাযোগ</h3>
            <ul className="space-y-5">
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="h-5 w-5 text-[#8EB69B] shrink-0" />
                <span className="text-[15px]">+880 1316-110209</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="h-5 w-5 text-[#8EB69B] shrink-0" />
                <span className="text-[15px]">support@biniyogbriddhi.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Briefcase className="h-5 w-5 text-[#8EB69B] shrink-0" />
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeylFDvEddVWDTgO9l6PqBqz0hSk0izOtr0IzRo_eyg-4QIZw/viewform" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[15px] hover:text-white transition-colors underline underline-offset-4"
                >
                  প্রফেশনাল পরামর্শ সার্ভিস
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Warning Banner */}
        <div className="mt-12 sm:mt-16 rounded-2xl border border-[#DAF1DE]/30 bg-[#DAF1DE]/10 p-4 text-xs sm:text-sm leading-relaxed text-white/90 flex items-start sm:items-center justify-center gap-2.5 max-w-4xl mx-auto shadow-sm text-center sm:text-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-0.5 sm:mt-0 shrink-0 text-[#8EB69B]"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span><strong className="font-semibold text-white">সতর্কতা:</strong> বিনিয়োগ মানেই ঝুঁকি ও সম্ভাবনা। সুদ আর বিনিয়োগ এক বিষয় না। সরাসরি ব্যবসায়ীর সাথে যোগাযোগের মাধ্যমে নিজে বুঝে বিনিয়োগ সিদ্ধান্ত গ্রহণ করুন।</span>
        </div>

        {/* Bottom Bar */}
        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm leading-relaxed text-white/50 text-center md:text-left">
            © {currentYear} বিনিয়োগ বৃদ্ধি. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-white/50 font-medium mt-4 md:mt-0 relative z-20">
            <span>প্রকৃত ব্যবসা বিনিয়োগ</span>
            <span className="hidden md:inline">·</span>
            <span className="flex items-center gap-1.5">
              Developed by <a href="https://artx.techvrs.com/" target="_blank" rel="noopener noreferrer" className="relative z-50 hover:text-white transition-colors underline underline-offset-4">ArtX TechVRS</a>
              <a href="https://www.linkedin.com/in/mdtarek404/" target="_blank" rel="noopener noreferrer" className="relative z-50 text-white/50 hover:text-white transition-colors inline-flex ml-1 p-1 -m-1" aria-label="Developer LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
