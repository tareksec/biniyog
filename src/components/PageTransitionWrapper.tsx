import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion, pageTransition } from "@/lib/animations";
import type { ReactNode } from "react";

interface PageTransitionWrapperProps {
  locationKey: string;
  children: ReactNode;
}

export default function PageTransitionWrapper({
  locationKey,
  children,
}: PageTransitionWrapperProps) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locationKey}
        initial={prefersReduced ? "animate" : "initial"}
        animate="animate"
        exit={prefersReduced ? "animate" : "exit"}
        variants={pageTransition}
        className="flex-grow"
        suppressHydrationWarning
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
