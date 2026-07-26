import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-28 sm:pt-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & About */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="সমৃদ্ধি" className="h-10 sm:h-12 w-auto rounded-xl" />
              </Link>
            </div>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              স্বচ্ছ, হালাল এবং নিরাপদ SME বিনিয়োগ প্ল্যাটফর্ম। আমাদের সাথে যুক্ত হয়ে আপনার হালাল ব্যবসার স্বপ্ন পূরণ করুন এবং নিরাপদ বিনিয়োগ নিশ্চিত করুন।
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/mohaimin-patwary-cfa-a8416aab/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6 font-display">কুইক লিংকস</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  হোমপেজ
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  সুযোগসমূহ
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  ড্যাশবোর্ড
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  কিভাবে কাজ করে
                </a>
              </li>
              <li>
                <a href="/#policy" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  আমাদের নীতিমালা
                </a>
              </li>
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6 font-display">সাপোর্ট ও লিগ্যাল</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  সাধারণ জিজ্ঞাসা (FAQ)
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  সাহায্য কেন্দ্র
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  শর্তাবলী (Terms)
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                  গোপনীয়তা নীতি (Privacy)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6 font-display">যোগাযোগ</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[15px]">গুলশান ১, ঢাকা, বাংলাদেশ<br/>হালাল ইনভেস্টমেন্ট জোন</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-[15px]">+880 1316-110209</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-[15px]">support@samriddhi.com</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} সমৃদ্ধি (Samriddhi). সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground font-medium mt-4 md:mt-0">
            <span>হালাল ও নিরাপদ বিনিয়োগ</span>
            <span className="hidden md:inline">·</span>
            <span className="flex items-center gap-1.5">
              Developed by <a href="https://artx.techvrs.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-4">ArtX TechVRS</a>
              <a href="https://www.linkedin.com/in/mdtarek404/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors inline-flex ml-1" aria-label="Developer LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
