'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send, ChevronDown, Info, MessageCircle } from 'lucide-react';
import { corporateEnquirySchema } from '@/lib/meal-validation';
import { KARACHI_AREAS, MEAL_SERVICE_TYPES, OUTSIDE_KARACHI_VALUE } from '@/data/meal-constants';
import { dailyWhatsAppHref } from '@/data/daily-meals';
import { cn } from '@/lib/utils';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function CorporateEnquiryForm() {
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(corporateEnquirySchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      designation: '',
      phone: '',
      whatsapp: '',
      email: '',
      officeLocation: '',
      address: '',
      serviceTypes: [],
      employeesCount: '',
      mealsCount: '',
      requiredDays: '',
      expectedStartDate: '',
      monthlyBudget: '',
      dietaryPreferences: '',
      message: '',
      website: '', // honeypot
    },
  });

  const areaOutside = watch('officeLocation') === OUTSIDE_KARACHI_VALUE;

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const res = await fetch('/api/meal-inquiries', {
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
        setServerError(
          data.error || 'Something went wrong. Please review your details and try again.'
        );
        return;
      }
      reset();
      setDone(true);
      if (typeof window !== 'undefined') {
        document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-gold-200 bg-white px-8 py-16 text-center shadow-card"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient text-ink-900 shadow-luxe-gold">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h3 className="mt-6 font-display text-3xl text-ink-900">Thank you for contacting Festigo Daily</h3>
        <p className="mt-3 max-w-md text-ink-500">
          Our corporate meal consultant will contact you shortly to discuss your office lunch
          requirements here in Karachi.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={dailyWhatsAppHref('Hello Festigo Daily! I just submitted a corporate meal enquiry.')}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Message us on WhatsApp
          </a>
          <button type="button" onClick={() => setDone(false)} className="btn-outline">
            Submit another enquiry
          </button>
        </div>
      </motion.div>
    );
  }

  const err = (name) => errors[name] && <p className="form-error">{errors[name].message}</p>;
  const invalid = (name) => cn('form-input', errors[name] && 'form-input-invalid');
  const legend = 'mb-4 text-[11px] font-semibold uppercase tracking-widest text-gold-700';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-ink-200/60 bg-cream-50/60 p-6 shadow-card sm:p-8 lg:p-10"
    >
      {/* Honeypot */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      {/* Company */}
      <fieldset className="border-0 p-0">
        <legend className={legend}>Company</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="companyName" className="form-label">
              Company Name <span className="text-gold-600">*</span>
            </label>
            <input id="companyName" type="text" placeholder="e.g. Systems Ltd."
              aria-invalid={!!errors.companyName} className={invalid('companyName')} {...register('companyName')} />
            {err('companyName')}
          </div>
          <div>
            <label htmlFor="contactName" className="form-label">
              Contact Person <span className="text-gold-600">*</span>
            </label>
            <input id="contactName" type="text" placeholder="Full name"
              aria-invalid={!!errors.contactName} className={invalid('contactName')} {...register('contactName')} />
            {err('contactName')}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="designation" className="form-label">Designation</label>
            <input id="designation" type="text" placeholder="e.g. Admin Manager (optional)"
              className={invalid('designation')} {...register('designation')} />
            {err('designation')}
          </div>
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className="mt-8 border-0 p-0">
        <legend className={legend}>Contact</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="text-gold-600">*</span>
            </label>
            <input id="phone" type="tel" placeholder="+92 3XX XXXXXXX"
              aria-invalid={!!errors.phone} className={invalid('phone')} {...register('phone')} />
            {err('phone')}
          </div>
          <div>
            <label htmlFor="whatsapp" className="form-label">WhatsApp Number</label>
            <input id="whatsapp" type="tel" placeholder="If different from phone (optional)"
              className={invalid('whatsapp')} {...register('whatsapp')} />
            {err('whatsapp')}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="form-label">
              Email Address <span className="text-gold-600">*</span>
            </label>
            <input id="email" type="email" placeholder="you@company.com"
              aria-invalid={!!errors.email} className={invalid('email')} {...register('email')} />
            {err('email')}
          </div>
        </div>
      </fieldset>

      {/* Location */}
      <fieldset className="mt-8 border-0 p-0">
        <legend className={legend}>Location — Karachi only</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="officeLocation" className="form-label">
              Karachi Area <span className="text-gold-600">*</span>
            </label>
            <div className="relative">
              <select id="officeLocation" defaultValue="" aria-invalid={!!errors.officeLocation}
                className={cn('form-input appearance-none pr-10', errors.officeLocation && 'form-input-invalid')}
                {...register('officeLocation')}>
                <option value="" disabled>Select your area</option>
                {KARACHI_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
                <option value={OUTSIDE_KARACHI_VALUE}>My area isn’t listed / outside Karachi</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            </div>
            {!areaOutside && err('officeLocation')}
          </div>
          <div>
            <label htmlFor="address" className="form-label">
              Complete Address <span className="text-gold-600">*</span>
            </label>
            <input id="address" type="text" placeholder="Building, street, block/sector"
              aria-invalid={!!errors.address} className={invalid('address')} {...register('address')} />
            {err('address')}
          </div>
        </div>

        {areaOutside && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-gold-300/60 bg-gold-50 p-4" role="status">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
            <div className="text-sm text-ink-600">
              <p className="font-medium text-ink-800">Festigo Daily currently serves Karachi only.</p>
              <p className="mt-1">
                If your office is within Karachi, please choose the nearest area above. Otherwise,{' '}
                <a
                  href={dailyWhatsAppHref('Hello Festigo Daily! Do you deliver to my area?')}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-gold-700 underline underline-offset-2 hover:text-gold-800"
                >
                  message us on WhatsApp
                </a>{' '}
                and we’ll do our best to help.
              </p>
            </div>
          </div>
        )}
      </fieldset>

      {/* Service type */}
      <fieldset className="mt-8 border-0 p-0">
        <legend className={legend}>
          Service Type <span className="text-gold-600">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MEAL_SERVICE_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200/60 bg-white px-4 py-3 text-sm text-ink-700 transition hover:border-gold-400 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50"
            >
              <input
                type="checkbox"
                value={type}
                className="h-4 w-4 rounded border-ink-300 text-gold-600 focus:ring-gold-500"
                {...register('serviceTypes')}
              />
              {type}
            </label>
          ))}
        </div>
        {err('serviceTypes')}
      </fieldset>

      {/* Order details */}
      <fieldset className="mt-8 border-0 p-0">
        <legend className={legend}>Order details</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="employeesCount" className="form-label">Number of Employees</label>
            <input id="employeesCount" type="number" min="1" inputMode="numeric" placeholder="e.g. 40"
              className={invalid('employeesCount')} {...register('employeesCount')} />
            {err('employeesCount')}
          </div>
          <div>
            <label htmlFor="mealsCount" className="form-label">
              Meals Per Day <span className="text-gold-600">*</span>
            </label>
            <input id="mealsCount" type="number" min="1" inputMode="numeric" placeholder="e.g. 35"
              aria-invalid={!!errors.mealsCount} className={invalid('mealsCount')} {...register('mealsCount')} />
            {err('mealsCount')}
          </div>
          <div>
            <label htmlFor="requiredDays" className="form-label">Service Days / Week</label>
            <input id="requiredDays" type="number" min="1" max="6" inputMode="numeric" placeholder="1–6"
              className={invalid('requiredDays')} {...register('requiredDays')} />
            {err('requiredDays')}
          </div>
          <div>
            <label htmlFor="expectedStartDate" className="form-label">Preferred Start Date</label>
            <input id="expectedStartDate" type="date" min={todayISO()}
              className={invalid('expectedStartDate')} {...register('expectedStartDate')} />
            {err('expectedStartDate')}
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="monthlyBudget" className="form-label">Estimated Monthly Budget (PKR)</label>
            <input id="monthlyBudget" type="number" min="0" inputMode="numeric" placeholder="Optional"
              className={invalid('monthlyBudget')} {...register('monthlyBudget')} />
            {err('monthlyBudget')}
          </div>
        </div>
      </fieldset>

      {/* Dietary + notes */}
      <fieldset className="mt-8 border-0 p-0">
        <legend className={legend}>Dietary &amp; additional requirements</legend>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="dietaryPreferences" className="form-label">Dietary Preferences</label>
            <input id="dietaryPreferences" type="text" placeholder="e.g. vegetarian options, no beef (optional)"
              className={invalid('dietaryPreferences')} {...register('dietaryPreferences')} />
            {err('dietaryPreferences')}
          </div>
          <div>
            <label htmlFor="message" className="form-label">Additional Requirements</label>
            <textarea id="message" rows={4} placeholder="Anything else we should know?"
              className={cn('form-input resize-none', errors.message && 'form-input-invalid')} {...register('message')} />
            {err('message')}
          </div>
        </div>
      </fieldset>

      {serverError && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-ink-400">
          Karachi only · Monday–Saturday · Your details stay private.
        </p>
        <button type="submit" disabled={isSubmitting || areaOutside} className="btn-gold w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send Enquiry <Send className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
