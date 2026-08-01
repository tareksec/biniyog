import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Infinity as InfinityIcon,
  MapPin,
  Pause,
  Settings,
  Sparkles,
  Square,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import heroBg from "@/assets/hero-bg.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stillwork — Calm Productivity for Focused Minds" },
      {
        name: "description",
        content:
          "Stillwork is a calm productivity space with focus timers, quiet task tracking and no notifications. Just clarity.",
      },
      { property: "og:title", content: "Stillwork — Calm Productivity for Focused Minds" },
      {
        property: "og:description",
        content:
          "A calm productivity space designed to help you focus on what actually matters—nothing more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const navItems = ["Home", "Pricing", "Features", "Documents", "About Us"];

const tasks = [
  { title: "Client call on monday", cat: "Sales and marketing", pct: 75, due: "3 Days Left" },
  { title: "Hand off to dev for shipping", cat: "UI/UX Design", pct: 90, due: "1 Day Left" },
];

const tools = ["Notion", "Gmail", "Slack", "Drive", "Evernote"];

const EASE = [0.22, 0.61, 0.36, 1] as const;

const heroGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

function Pin() {
  return (
    <div className="flex justify-center pb-3">
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [-12, -8, -12] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <MapPin className="size-6 fill-pin text-pin drop-shadow-sm" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}

function NoteCard({
  label,
  children,
  delay,
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      className="group [perspective:1000px]"
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      <Pin />
      <p className="pb-3 text-center text-sm font-semibold text-foreground">{label}</p>
      <motion.div
        className="relative"
        whileHover={{ y: -8, rotate: -0.6 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="absolute -right-2 -top-2 h-full w-full rotate-2 rounded-2xl border border-border bg-card/70 transition-transform duration-500 group-hover:rotate-3" />
        <div className="relative rounded-2xl border border-border bg-card p-4 shadow-note transition-shadow duration-500 group-hover:shadow-note-lift">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Index() {
  const reduce = useReducedMotion();
  const dash = 276;

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <motion.header
          className="flex h-[68px] items-center justify-between"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <a href="/" className="group flex items-center gap-2">
            <motion.span
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="inline-flex"
            >
              <InfinityIcon className="size-6 text-accent" strokeWidth={2.5} />
            </motion.span>
            <span className="text-lg font-semibold tracking-tight text-foreground">Stillwork</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item, i) => (
              <motion.a
                key={item}
                href="/"
                className="relative text-sm font-medium text-nav-link transition-colors duration-150 hover:text-foreground"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE }}
              >
                {item}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full bg-accent"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                />
              </motion.a>
            ))}
          </nav>
          <motion.a
            href="/"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
          >
            Sign in
          </motion.a>
        </motion.header>

        <main
          className="hero-panel mt-4 overflow-hidden rounded-[32px] px-6 pb-20 pt-16 sm:px-12"
          style={{ ["--hero-image" as string]: `url(${heroBg.url})` }}
        >
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={heroGroup}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={heroItem}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card/70 py-1 pl-1 pr-4 backdrop-blur-sm"
            >
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                New
              </span>
              <span className="text-xs font-medium tracking-wide text-foreground/80">
                No notifications. No pressure. Just clarity.
              </span>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-7 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Calm{" "}
              <motion.span
                className="inline-flex size-10 translate-y-1 items-center justify-center rounded-xl bg-card text-base font-semibold text-accent-foreground shadow-note sm:size-12 lg:size-14"
                initial={{ scale: 0.7, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.45, type: "spring", stiffness: 220, damping: 14 }}
                whileHover={{ rotate: 8, scale: 1.06 }}
              >
                01
              </motion.span>{" "}
              productivity for focused minds
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mx-auto mt-6 max-w-[560px] text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              A calm productivity space designed to help you focus on what actually
              matters—nothing more.
            </motion.p>

            <motion.div variants={heroItem} className="mt-8">
              <motion.a
                href="/"
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-[15px] font-semibold text-primary-foreground shadow-note hover:shadow-note-lift"
              >
                Start calmly
                <motion.span
                  className="inline-flex"
                  animate={reduce ? {} : { rotate: [0, 14, -8, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="size-4" />
                </motion.span>
              </motion.a>
            </motion.div>
          </motion.div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-12">
            <NoteCard label="Daily Task assignments" delay={0.05}>
              <ul className="space-y-4">
                {tasks.map((t, i) => (
                  <li key={t.title} className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground">{t.cat}</p>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-accent-soft"
                      role="progressbar"
                      aria-valuenow={t.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${t.title} progress`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${t.pct}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: EASE }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground">
                        <Clock className="size-3" /> {t.due}
                      </span>
                      <span className="flex -space-x-2">
                        {[0, 1, 2].map((j) => (
                          <motion.span
                            key={j}
                            className="size-5 rounded-full border-2 border-card bg-accent-soft"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: 0.4 + i * 0.1 + j * 0.08,
                              type: "spring",
                              stiffness: 300,
                              damping: 18,
                            }}
                          />
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </NoteCard>

            <NoteCard label="Pomodoro Timer" delay={0.18}>
              <div className="mb-3 flex gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground">
                  Focus
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  Break
                </span>
              </div>
              <div className="flex flex-col items-center py-2">
                <div className="relative size-32">
                  <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="var(--accent-soft)"
                      strokeWidth="7"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={dash}
                      initial={{ strokeDashoffset: dash }}
                      whileInView={{ strokeDashoffset: 90 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 1.6, delay: 0.35, ease: EASE }}
                    />
                  </svg>
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
                  >
                    <span className="text-xl font-semibold text-foreground">31:47</span>
                    <span className="text-[10px] text-muted-foreground">Time to focus</span>
                  </motion.div>
                </div>
                <div className="mt-4 flex items-center gap-4 rounded-full bg-secondary px-4 py-2">
                  {[
                    { label: "Pause timer", Icon: Pause },
                    { label: "Stop timer", Icon: Square },
                    { label: "Timer settings", Icon: Settings },
                  ].map(({ label, Icon }) => (
                    <motion.button
                      key={label}
                      aria-label={label}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="text-foreground/70 hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </NoteCard>

            <NoteCard label="Integration with all your tools" delay={0.31}>
              <div className="grid grid-cols-2 gap-3 py-2">
                {tools.map((tool, i) => (
                  <motion.div
                    key={tool}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-note"
                    initial={{ opacity: 0, y: 14, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: i % 2 === 1 ? 8 : 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, delay: 0.3 + i * 0.08, ease: EASE }}
                    whileHover={{ y: (i % 2 === 1 ? 8 : 0) - 4, scale: 1.04 }}
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold text-accent-foreground">
                      {tool.slice(0, 2)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">{tool}</span>
                  </motion.div>
                ))}
              </div>
            </NoteCard>
          </div>
        </main>
      </div>
    </div>
  );
}
