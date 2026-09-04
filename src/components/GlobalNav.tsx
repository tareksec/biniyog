import { useState, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, GraduationCap, Briefcase, LayoutDashboard, Calculator, BookOpen, User } from "lucide-react";
import { GlassDock, type DockItem } from "@/components/ui/glass-dock";

export function GlobalNav() {
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();
  const router = useRouterState();
  
  // Track active section on scroll (only applies on home page)
  useEffect(() => {
    if (router.location.pathname !== '/') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    
    const sections = ["top", "why", "how", "expert", "calculator", "opportunities"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [router.location.pathname]);

  // Hide on admin pages — must be AFTER all hooks (Rules of Hooks)
  if (router.location.pathname.startsWith('/admin')) {
    return null;
  }

  const scrollTo = (id: string) => {
    if (router.location.pathname !== '/') {
      navigate({ to: '/', hash: id });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dockItems: DockItem[] = [
    { title: "হোম", icon: Home, onClick: () => scrollTo("top") },
    { title: "আমাদের সম্পর্কে", icon: User, onClick: () => { navigate({ to: "/about" as any }); } },
    { title: "এক্সপার্ট", icon: GraduationCap, onClick: () => scrollTo("expert") },
    { title: "ক্যালকুলেটর", icon: Calculator, onClick: () => scrollTo("calculator"), accent: true },
    { title: "ব্লগ", icon: BookOpen, onClick: () => { navigate({ to: "/blog" }); } },
    { title: "সক্রিয় সুযোগ", icon: Briefcase, onClick: () => { navigate({ to: "/opportunities" }); }, highlight: true },
    { title: "ড্যাশবোর্ড", icon: LayoutDashboard, onClick: () => { navigate({ to: "/dashboard" }); } },
  ];

  const leftContent = (
    <button onClick={() => scrollTo("top")} className="flex items-center transition-transform hover:scale-105 cursor-pointer">
      <img src="/logo.png" alt="বিনিয়োগ বৃদ্ধি" className="h-7 sm:h-10 w-auto rounded-lg shrink-0" />
    </button>
  );

  return (
    <div className="fixed left-0 right-0 bottom-4 sm:bottom-6 z-50 justify-center px-2 sm:px-4 transition-all duration-300 pointer-events-none hidden md:flex">
      <div className="pointer-events-auto">
        <GlassDock 
          items={dockItems} 
          leftContent={leftContent} 
          className="mx-auto" 
        />
      </div>
    </div>
  );
}
