'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import { inquirySchema, EVENT_TYPES, BUDGET_RANGES } from '@/lib/validation';
import { cn } from '@/lib/utils';

const eventOptions = EVENT_TYPES.filter((t) => t !== 'Contact / General');

export default function BookingForm() {
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      eventType: '',
      eventDate: '',
      guestCount: '',
      budget: '',
      message: '',
      company: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, msgs]) =>
            setError(field, { message: Array.isArray(msgs) ? msgs[0] : String(msgs) })
          );
        }
        setServerError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      reset();
      setDone(true);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gold-200 bg-white px-8 py-16 text-center shadow-card"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient text-ink-900 shadow-luxe-gold">
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </span>
            <h3 className="mt-6 font-display text-3xl text-ink-900">Thank you</h3>
            <p className="mt-3 max-w-md text-ink-500">
              Your inquiry has landed safely with our atelier. A member of our team will
              reach out personally within one business day to begin shaping your celebration.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="btn-outline mt-8"
            >
              Submit another inquiry
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="rounded-2xl border border-ink-200/60 bg-cream-50/60 p-6 shadow-card sm:p-8 lg:p-10"
          >
            {/* Honeypot */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label>
                Company
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register('company')}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name <span className="text-gold-600">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Isabella Hartwell"
                  aria-invalid={!!errors.name}
                  className={cn('form-input', errors.name && 'form-input-invalid')}
                  {...register('name')}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email <span className="text-gold-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  aria-invalid={!!errors.email}
                  className={cn('form-input', errors.email && 'form-input-invalid')}
                  {...register('email')}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone <span className="text-gold-600">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (212) 555-0100"
                  aria-invalid={!!errors.phone}
                  className={cn('form-input', errors.phone && 'form-input-invalid')}
                  {...register('phone')}
                />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>

              <div>
                <label htmlFor="eventType" className="form-label">
                  Event Type <span className="text-gold-600">*</span>
                </label>
                <div className="relative">
                  <select
                    id="eventType"
                    aria-invalid={!!errors.eventType}
                    className={cn(
                      'form-input appearance-none pr-10',
                      errors.eventType && 'form-input-invalid'
                    )}
                    defaultValue=""
                    {...register('eventType')}
                  >
                    <option value="" disabled>
                      Select an event type
                    </option>
                    {eventOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>
                {errors.eventType && <p className="form-error">{errors.eventType.message}</p>}
              </div>

              <div>
                <label htmlFor="eventDate" className="form-label">
                  Event Date
                </label>
                <input
                  id="eventDate"
                  type="date"
                  min={today}
                  className={cn('form-input', errors.eventDate && 'form-input-invalid')}
                  {...register('eventDate')}
                />
                {errors.eventDate && <p className="form-error">{errors.eventDate.message}</p>}
              </div>

              <div>
                <label htmlFor="guestCount" className="form-label">
                  Guest Count
                </label>
                <input
                  id="guestCount"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="120"
                  className={cn('form-input', errors.guestCount && 'form-input-invalid')}
                  {...register('guestCount')}
                />
                {errors.guestCount && (
                  <p className="form-error">{errors.guestCount.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="budget" className="form-label">
                  Estimated Budget
                </label>
                <div className="relative">
                  <select
                    id="budget"
                    className="form-input appearance-none pr-10"
                    defaultValue=""
                    {...register('budget')}
                  >
                    <option value="">Prefer not to say</option>
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="form-label">
                  Tell us about your vision
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Share your ideas, venue, must-haves, or any questions you have…"
                  className={cn(
                    'form-input resize-none',
                    errors.message && 'form-input-invalid'
                  )}
                  {...register('message')}
                />
                {errors.message && <p className="form-error">{errors.message.message}</p>}
              </div>
            </div>

            {serverError && (
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </p>
            )}

            <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs text-ink-400">
                We respond within one business day. Your details stay private.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Submit Inquiry <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
