import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/animations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Bengali digit map
const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBengali(n: number | string): string {
  return String(n)
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

  const valRef = useRef(0);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (prefersReduced || !ref.current) return;
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 85%",
      once: true,
      onEnter: () => setHasEntered(true),
    });
    return () => {
      st.kill();
    };
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) {
      setVal(to);
      valRef.current = to;
      return;
    }
    
    if (!hasEntered) return;

    const obj = { v: valRef.current };
    const tw = gsap.to(obj, {
      v: to,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setVal(obj.v);
        valRef.current = obj.v;
      },
    });
    return () => {
      tw.kill();
    };
  }, [to, duration, prefersReduced, hasEntered]);

  const formattedVal = Math.round(val).toLocaleString("en-IN");
  
  return (
    <span ref={ref}>
      {prefix}
      {bengali ? toBengali(formattedVal) : formattedVal}
      {suffix}
    </span>
  );
}
