import { useState, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, GraduationCap, Briefcase, LayoutDashboard } from "lucide-react";
import { GlassDock, type DockItem } from "@/components/ui/glass-dock";

export function GlobalNav() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();
  const router = useRouterState();
  
  // Hide on admin pages
  if (router.location.pathname.startsWith('/admin')) {
    return null;
  }

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
    
    const sections = ["top", "why", "how", "expert", "opportunities"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [router.location.pathname]);

  const scrollTo = (id: string) => {
    setOpen(false);
    if (router.location.pathname !== '/') {
      navigate({ to: '/', hash: id });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dockItems: DockItem[] = [
    { title: "হোম", icon: Home, onClick: () => scrollTo("top") },
    { title: "এক্সপার্ট", icon: GraduationCap, onClick: () => scrollTo("expert") },
    { title: "সক্রিয় সুযোগ", icon: Briefcase, onClick: () => { setOpen(false); navigate({ to: "/opportunities" }); }, highlight: true },
    { title: "ড্যাশবোর্ড", icon: LayoutDashboard, onClick: () => { setOpen(false); navigate({ to: "/dashboard" }); } },
  ];

  const leftContent = (
    <button onClick={() => scrollTo("top")} className="flex items-center gap-2 transition-transform hover:scale-105">
      <img src="/logo.png" alt="সমৃদ্ধি" className="h-8 sm:h-10 w-auto rounded-lg" />
    </button>
  );

  const rightContent = (
    <div className="flex items-center gap-2 sm:gap-3">

      
      {/* Mobile hamburger */}
      <button
        className="grid h-10 w-10 place-items-center rounded-full bg-muted/50 text-foreground transition hover:bg-muted active:scale-95 md:hidden"
        aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M4 12h16M4 6h16M4 18h16" /></svg>
        )}
      </button>
    </div>
  );

  return (
    <>
      <div className="fixed left-0 right-0 bottom-4 sm:bottom-6 z-50 flex justify-center px-4 transition-all duration-300">
        <GlassDock 
          items={dockItems} 
          leftContent={leftContent} 
          rightContent={rightContent} 
          className="mx-auto" 
        />
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity md:hidden">
          <nav className="absolute left-4 right-4 bottom-24 rounded-3xl border border-border/50 bg-background/95 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-200" aria-label="মোবাইল নেভিগেশন">
            <div className="flex flex-col gap-1 text-[15px] font-medium">
              {dockItems.map((item) => {
                const id = item.title === "হোম" ? "top" : item.title === "এক্সপার্ট" ? "expert" : "";
                const isOpp = item.title === "সক্রিয় সুযোগ";
                const isActive = (id && activeSection === id && router.location.pathname === '/') || (isOpp && router.location.pathname.startsWith('/opportunities'));
                return (
                  <button
                    key={item.title}
                    onClick={item.onClick}
                    className={`rounded-2xl px-5 py-3.5 transition-colors text-left ${
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
            

          </nav>
        </div>
      )}
    </>
  );
}
