'use client';

import { motion } from 'framer-motion';

/**
 * Scroll-triggered fade-and-rise reveal. Respects prefers-reduced-motion via
 * Framer Motion's built-in reduced-motion handling.
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 28,
  duration = 0.7,
  once = true,
  amount = 0.2,
  className,
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
