import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  bengali?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
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
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {bengali ? toBengali(val) : Math.round(val)}
      {suffix}
    </span>
  );
}
