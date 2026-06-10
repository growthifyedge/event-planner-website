'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email.'),
  phone: z.string().trim().min(7, 'Please enter a valid phone number.').max(40),
  message: z.string().trim().max(4000).optional(),
  company: z.literal('').optional(),
});

export default function ContactForm() {
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '', company: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, eventType: 'Contact / General' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      reset();
      setDone(true);
    } catch {
      setServerError('Network error. Please try again.');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-2xl border border-gold-200 bg-white px-8 py-14 text-center shadow-card"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-ink-900">
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <h3 className="mt-5 font-display text-2xl text-ink-900">Message sent</h3>
          <p className="mt-2 text-ink-500">We&apos;ll be in touch very soon. Thank you for reaching out.</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <input type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="form-label">
                Full Name <span className="text-gold-600">*</span>
              </label>
              <input
                id="c-name"
                type="text"
                className={cn('form-input', errors.name && 'form-input-invalid')}
                {...register('name')}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="c-phone" className="form-label">
                Phone <span className="text-gold-600">*</span>
              </label>
              <input
                id="c-phone"
                type="tel"
                className={cn('form-input', errors.phone && 'form-input-invalid')}
                {...register('phone')}
              />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="c-email" className="form-label">
              Email <span className="text-gold-600">*</span>
            </label>
            <input
              id="c-email"
              type="email"
              className={cn('form-input', errors.email && 'form-input-invalid')}
              {...register('email')}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="c-message" className="form-label">
              How can we help?
            </label>
            <textarea
              id="c-message"
              rows={5}
              className="form-input resize-none"
              placeholder="Tell us a little about what you have in mind…"
              {...register('message')}
            />
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send Message <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
