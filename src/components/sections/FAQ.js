'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { faqs } from '@/data/faqs';
import { cn } from '@/lib/utils';

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink-200/60 border-y border-ink-200/60">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-lg text-ink-900 sm:text-xl">{f.q}</span>
              <Plus
                className={cn(
                  'h-5 w-5 shrink-0 text-gold-600 transition-transform duration-300',
                  isOpen && 'rotate-45'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 leading-relaxed text-ink-500">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
