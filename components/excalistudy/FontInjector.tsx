"use client";

import { useEffect } from "react";
import { useAppState } from "./AppStateContext";

export function FontInjector() {
  const { textFont } = useAppState();

  useEffect(() => {
    // Remove existing font classes from body
    document.body.classList.remove("font-sans", "font-serif", "font-caveat", "font-mono");
    // Add current text font class
    document.body.classList.add(textFont);
  }, [textFont]);

  return null;
}
