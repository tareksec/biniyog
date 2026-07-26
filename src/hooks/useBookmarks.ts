import { useState, useEffect } from "react";

const EVENT_NAME = "bookmarks_changed";
const STORAGE_KEY = "biniyog_saved_opportunities";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load from storage once on mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setBookmarks(stored ? JSON.parse(stored) : []);
      } catch {
        setBookmarks([]);
      }
    };
    
    window.addEventListener(EVENT_NAME, handleStorageChange);
    // Sync across tabs
    const handleCrossTab = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) handleStorageChange();
    };
    window.addEventListener("storage", handleCrossTab);
    
    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener("storage", handleCrossTab);
    };
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const isSaved = prev.includes(id);
      const newBookmarks = isSaved ? prev.filter((b) => b !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      window.dispatchEvent(new Event(EVENT_NAME));
      return newBookmarks;
    });
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return { bookmarks, toggleBookmark, isBookmarked };
}
