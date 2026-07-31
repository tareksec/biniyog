import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/animations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Bengali digit map
const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBengali(n: number): string {
  return String(Math.round(n))
    .split("")
    .map((d) => (/\d/.test(d) ? BN[Number(d)] : d))
    .join("");
}

export function CountUp({
  to,
  suffix = "",
  prefix = "",
  bengali = true,
  duration = 1.0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  bengali?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to); // Start at final value for reduced-motion
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setVal(to);
      return;
    }
    if (!ref.current) return;
    const obj = { v: 0 };
    const tw = gsap.to(obj, {
      v: to,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => setVal(obj.v),
    });
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, [to, duration, prefersReduced]);

  return (
    <span ref={ref}>
      {prefix}
      {bengali ? toBengali(val) : Math.round(val)}
      {suffix}
    </span>
  );
}
