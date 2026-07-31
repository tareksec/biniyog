"use client"

import { useEffect, useState, useMemo, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FlipFadeTextProps {
    words?: string[]
    interval?: number
    className?: string
    textClassName?: string
    letterDuration?: number
    staggerDelay?: number
    exitStaggerDelay?: number
}

const defaultWords = ["LOADING", "COMPUTING", "SEARCHING", "RETRIEVING", "ASSEMBLING"]

// Memoized Letter component for performance
const Letter = memo(function Letter({ char, letterDuration }: { char: string; letterDuration: number }) {
    return (
        <motion.span
            style={{ transformStyle: "preserve-3d" }}
            variants={{
                initial: { rotateX: 90, y: 20, opacity: 0, filter: "blur(8px)" },
                animate: { 
                    rotateX: 0, 
                    y: 0, 
                    opacity: 1, 
                    filter: "blur(0px)", 
                    transition: { duration: letterDuration, ease: [0.2, 0.65, 0.3, 0.9] } 
                },
                exit: { 
                    rotateX: -90, 
                    y: -20, 
                    opacity: 0, 
                    filter: "blur(8px)", 
                    transition: { duration: letterDuration * 0.67, ease: "easeIn" } 
                },
            }}
            className="inline-block whitespace-pre"
        >
            {char}
        </motion.span>
    )
})

// Memoized Word component for performance
const Word = memo(function Word({ text, staggerDelay, exitStaggerDelay, letterDuration, textClassName }: { text: string; staggerDelay: number; exitStaggerDelay: number; letterDuration: number; textClassName?: string }) {
    // Safely split Bengali and other complex scripts using Intl.Segmenter
    const letters = useMemo(() => {
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text)).map(s => s.segment);
        }
        return text.split("");
    }, [text])

    return (
        <motion.div
            className={cn("flex flex-wrap justify-center font-bold", textClassName)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
                initial: { opacity: 1 },
                animate: { opacity: 1, transition: { staggerChildren: staggerDelay } },
                exit: { opacity: 1, transition: { staggerChildren: exitStaggerDelay } },
            }}
        >
            {letters.map((char, i) => (
                <Letter key={`${char}-${i}`} char={char} letterDuration={letterDuration} />
            ))}
        </motion.div>
    )
})

export function FlipFadeText({
    words = defaultWords,
    interval = 2500,
    className,
    textClassName,
    letterDuration = 0.6,
    staggerDelay = 0.05,
    exitStaggerDelay = 0.02,
}: FlipFadeTextProps) {
    const [index, setIndex] = useState(0)

    const updateIndex = useCallback(() => {
        setIndex((prev) => (prev + 1) % words.length)
    }, [words.length])

    useEffect(() => {
        if (words.length <= 1) return;
        const timer = setInterval(updateIndex, interval)
        return () => clearInterval(timer)
    }, [updateIndex, interval, words.length])

    const currentWord = useMemo(() => words[index], [words, index])

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="relative flex items-center justify-center" style={{ perspective: "1000px" }}>
                <AnimatePresence mode="wait">
                    <Word
                        key={currentWord}
                        text={currentWord}
                        staggerDelay={staggerDelay}
                        exitStaggerDelay={exitStaggerDelay}
                        letterDuration={letterDuration}
                        textClassName={textClassName}
                    />
                </AnimatePresence>
            </div>
        </div>
    )
}

export default FlipFadeText
