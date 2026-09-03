import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/animations";

// Bengali digit map
export const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBengali(n: number | string): string {
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
  const [val, setVal] = useState(0); // Start at 0 for SSR/client consistency — animate to `to` client-side
  const prefersReduced = usePrefersReducedMotion();
  
  // margin "-15% 0px" approximates "top 85%" from ScrollTrigger
  const isInView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  
  const valRef = useRef(0);

  useEffect(() => {
    if (prefersReduced) {
      setVal(to);
      valRef.current = to;
      return;
    }
    
    if (!isInView) return;

    const controls = animate(valRef.current, to, {
      duration,
      ease: "easeOut",
      onUpdate: (value) => {
        setVal(value);
        valRef.current = value;
      },
    });

    return () => controls.stop();
  }, [to, duration, prefersReduced, isInView]);

  const formattedVal = Math.round(val).toLocaleString("en-IN");
  
  return (
    <span ref={ref}>
      {prefix}
      {bengali ? toBengali(formattedVal) : formattedVal}
      {suffix}
    </span>
  );
}
