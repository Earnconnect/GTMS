"use client";
import React, { useEffect, useRef, type ReactNode } from "react";

export function AnimateIn({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => el.classList.add("show"), delay);
          ob.unobserve(el);
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [delay]);

  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref as React.RefObject<HTMLElement>} className={`reveal ${className}`}>
      {children}
    </Comp>
  );
}
