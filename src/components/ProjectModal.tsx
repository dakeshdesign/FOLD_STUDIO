import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { EMAIL_CONFIG } from '../config/emailConfig';
import { snapshotElement, playPaper, getLastPointer, prefersReducedMotion } from '../utils/paperCrumple';
import {
  SERVICES,
  BUDGETS,
  LIMITS,
  toggleService,
  validateInquiryFields,
  buildInquiryPayload,
  newIdempotencyKey,
  type FormErrors,
} from '../utils/inquiryForm';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export type { FormErrors };

const NETWORK_ERROR_MESSAGE = "We couldn't submit your inquiry. Please try again.";

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, initialService }) => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>('');
  const [submittedName, setSubmittedName] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  // One key per inquiry attempt: retries reuse it so the server never stores a duplicate.
  const idempotencyKeyRef = useRef<string>(newIdempotencyKey());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    services: [] as string[],
    budget: '',
    details: '',
    honeypot: '', // Hidden honeypot field for anti-spam
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // The summary notice only describes the last submit attempt; editing the form clears it.
  useEffect(() => {
    setFormError('');
  }, [formData]);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const firstServiceBtnRef = useRef<HTMLButtonElement>(null);
  const firstBudgetBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Paper transition: the form unfolds out of a crumpled ball and crushes back into one on close
  const [revealed, setRevealed] = useState<boolean>(false);
  const [closing, setClosing] = useState<boolean>(false);
  const closingRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!isOpen) return;
    closingRef.current = false;
    setClosing(false);
    setRevealed(false);
    let cancelled = false;
    const origin = getLastPointer();
    const reveal = () => {
      if (cancelled) return;
      setRevealed(true);
      nameInputRef.current?.focus({ preventScroll: true });
    };
    (document.fonts?.ready ?? Promise.resolve()).then(() =>
      requestAnimationFrame(() => {
        const el = modalRef.current;
        if (cancelled || !el) return;
        if (prefersReducedMotion()) return reveal();
        const ok = playPaper({ rect: el.getBoundingClientRect(), texture: snapshotElement(el), mode: 'unfold', origin, onDone: reveal });
        if (!ok) reveal();
      })
    );
    return () => { cancelled = true; };
  }, [isOpen]);

  const closeWithCrumple = (after: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const el = modalRef.current;
    if (!el || prefersReducedMotion()) { after(); return; }
    const ok = playPaper({ rect: el.getBoundingClientRect(), texture: snapshotElement(el), mode: 'crumple', onDone: after });
    if (ok) setRevealed(false);
    else after();
  };

  const availableServices = SERVICES;
  const budgetOptions = BUDGETS;

  // Sync initial service prop (case-insensitive matching)
  useEffect(() => {
    if (initialService) {
      const matched = availableServices.find(
        (s) => s.toLowerCase() === initialService.toLowerCase()
      );
      if (matched && !formData.services.includes(matched)) {
        setFormData((prev) => ({
          ...prev,
          services: [...prev.services, matched],
        }));
      }
    }
  }, [initialService]);

  // Lock body scroll, capture previous focus, and set up accessibility key listeners
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        // Escape closes the modal
        if (e.key === 'Escape') {
          handleClose();
          return;
        }

        // Focus trap inside the modal dialog
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        triggerRef.current?.focus();
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const updated = toggleService(prev.services, service);

      if (updated.length > 0 && errors.services) {
        setErrors((e) => ({ ...e, services: undefined }));
      }

      return { ...prev, services: updated };
    });
  };

  const handleBudgetSelect = (option: string) => {
    setFormData((prev) => ({ ...prev, budget: option }));
    if (errors.budget) {
      setErrors((e) => ({ ...e, budget: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = validateInquiryFields(formData);

    setErrors(newErrors);

    // Scroll and focus to the first invalid field
    if (newErrors.name) {
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
    } else if (newErrors.email) {
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      emailInputRef.current?.focus();
    } else if (newErrors.services) {
      servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstServiceBtnRef.current?.focus();
    } else if (newErrors.budget) {
      budgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstBudgetBtnRef.current?.focus();
    }

    const valid = Object.keys(newErrors).length === 0;
    setFormError(valid ? '' : 'Please complete the required fields.');
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submissions
    if (status === 'submitting') return;

    if (!validateForm()) {
      return;
    }

    // Spam honeypot protection: if filled, silently treat as success
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      setSubmittedName(formData.name.trim());
      setStatus('success');
      resetFormData();
      return;
    }

    setStatus('submitting');
    setApiErrorMessage('');
    setFormError('');
    const clientName = formData.name.trim();
    setSubmittedName(clientName);

    try {
      const response = await fetch(EMAIL_CONFIG.BACKEND_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...buildInquiryPayload(formData, idempotencyKeyRef.current), honeypot: formData.honeypot }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setStatus('success');
        resetFormData();
        return;
      }

      if (response.status === 422 && data.errors) {
        // Server-side validation: back to the form with the typed values intact.
        const fieldErrors: FormErrors = {};
        for (const key of ['name', 'email', 'services', 'budget'] as const) {
          if (typeof data.errors[key] === 'string') fieldErrors[key] = data.errors[key];
        }
        if (typeof data.errors.projectBrief === 'string') fieldErrors.details = data.errors.projectBrief;
        setErrors(fieldErrors);
        setFormError('Please complete the required fields.');
        setStatus('idle');
        return;
      }

      setStatus('error');
      setApiErrorMessage(
        response.status === 429 ? 'Too many submissions. Please wait a few minutes and try again.' : NETWORK_ERROR_MESSAGE
      );
    } catch (error) {
      console.error('Inquiry Submission Error:', error);
      setStatus('error');
      setApiErrorMessage(NETWORK_ERROR_MESSAGE);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      services: [],
      budget: '',
      details: '',
      honeypot: '',
    });
    setErrors({});
    setFormError('');
    idempotencyKeyRef.current = newIdempotencyKey();
  };

  const handleClose = () => {
    closeWithCrumple(onClose);
  };

  const resetFormAndClose = () => {
    closeWithCrumple(() => {
      setStatus('idle');
      resetFormData();
      setApiErrorMessage('');
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9500] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Dark translucent backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={closing ? { duration: 0.25, delay: 0.3 } : { duration: 0.2 }}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
          onClick={handleClose}
        />

        {/* Modal Container */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0 }}
          style={{ pointerEvents: revealed ? 'auto' : 'none' }}
          className="relative z-10 w-full max-w-3xl bg-[#F5F3EE] border border-[#E5E2DA] p-6 sm:p-10 md:p-12 text-[#202020] shadow-2xl my-auto max-h-[90vh] overflow-y-auto rounded-none"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-5 mb-8">
            <span className="font-mono text-[10px] font-medium text-[#8E8B82] uppercase tracking-widest">
              INQUIRY // FOLD STUDIO
            </span>

            {/* Square Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 border border-[#E5E2DA] hover:border-[#202020] bg-white flex items-center justify-center transition-all cursor-pointer group"
              aria-label="Close Inquiry Modal"
            >
              <X className="w-4 h-4 text-[#202020] group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Hidden Honeypot Anti-Spam Field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_honeypot">Leave this field blank</label>
            <input
              id="website_honeypot"
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* MAIN FORM VIEW */}
          {status === 'idle' || status === 'submitting' ? (
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Heading & Mailto Subtitle */}
              <div className="space-y-2">
                <h3
                  id="modal-title"
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#202020]"
                >
                  START A PROJECT
                </h3>
                <p className="font-mono text-[10px] sm:text-[11px] text-[#8E8B82] uppercase tracking-widest leading-relaxed">
                  FILL IN THE BRIEF BELOW OR EMAIL DIRECTLY TO{' '}
                  <a
                    href="mailto:enquiryfoldstudio@gmail.com"
                    className="text-[#202020] border-b border-[#202020] hover:opacity-70 transition-opacity font-medium"
                  >
                    ENQUIRYFOLDSTUDIO@GMAIL.COM
                  </a>
                </p>
              </div>

              {/* Name & Work Email (2-Column Desktop, Stacked Mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Field 1: Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="inquiry-name"
                    className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium"
                  >
                    YOUR NAME *
                  </label>
                  <input
                    id="inquiry-name"
                    ref={nameInputRef}
                    type="text"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    placeholder="Alex Morgan"
                    maxLength={LIMITS.nameMax}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
                    }}
                    className={`w-full bg-white border px-4 py-3.5 text-xs text-[#202020] focus:outline-none transition-colors ${
                      errors.name ? 'border-[#D9381E] bg-[#FFF8F7]' : 'border-[#E5E2DA] focus:border-[#202020]'
                    }`}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      role="alert"
                      className="font-mono text-[10px] text-[#D9381E] uppercase tracking-wider flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Field 2: Work Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="inquiry-email"
                    className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium"
                  >
                    WORK EMAIL *
                  </label>
                  <input
                    id="inquiry-email"
                    ref={emailInputRef}
                    type="email"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    placeholder="alex@brand.com"
                    maxLength={LIMITS.emailMax}
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors((err) => ({ ...err, email: undefined }));
                    }}
                    className={`w-full bg-white border px-4 py-3.5 text-xs text-[#202020] focus:outline-none transition-colors ${
                      errors.email ? 'border-[#D9381E] bg-[#FFF8F7]' : 'border-[#E5E2DA] focus:border-[#202020]'
                    }`}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      role="alert"
                      className="font-mono text-[10px] text-[#D9381E] uppercase tracking-wider flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Field 3: Required Services (Multi-Select Chips) */}
              <div ref={servicesRef} className="space-y-3">
                <label className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                  REQUIRED SERVICES *
                </label>
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Required Services">
                  {availableServices.map((service, index) => {
                    const isSelected = formData.services.includes(service);
                    return (
                      <button
                        ref={index === 0 ? firstServiceBtnRef : undefined}
                        type="button"
                        key={service}
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => handleServiceToggle(service)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            handleServiceToggle(service);
                          }
                        }}
                        className={`px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#202020] text-[#F5F3EE] font-medium border border-[#202020] shadow-xs'
                            : 'bg-white border border-[#E5E2DA] text-[#666666] hover:text-[#202020] hover:border-[#202020]/50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {service}
                      </button>
                    );
                  })}
                </div>
                {errors.services && (
                  <p
                    role="alert"
                    className="font-mono text-[10px] text-[#D9381E] uppercase tracking-wider flex items-center space-x-1 pt-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.services}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Estimated Budget (Single Select Cards) */}
              <div ref={budgetRef} className="space-y-3">
                <label className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                  ESTIMATED BUDGET (INR) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Estimated Budget">
                  {budgetOptions.map((range, index) => {
                    const isSelected = formData.budget === range;
                    return (
                      <button
                        ref={index === 0 ? firstBudgetBtnRef : undefined}
                        type="button"
                        key={range}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleBudgetSelect(range)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            handleBudgetSelect(range);
                          }
                        }}
                        className={`py-3 px-3 font-mono text-[10px] sm:text-[11px] text-center uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border border-[#202020] bg-[#202020] text-[#F5F3EE] font-medium shadow-xs'
                            : 'border border-[#E5E2DA] bg-white text-[#666666] hover:text-[#202020] hover:border-[#202020]/50'
                        }`}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
                {errors.budget && (
                  <p
                    role="alert"
                    className="font-mono text-[10px] text-[#D9381E] uppercase tracking-wider flex items-center space-x-1 pt-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.budget}</span>
                  </p>
                )}
              </div>

              {/* Field 5: Project Brief */}
              <div className="space-y-2">
                <label
                  htmlFor="inquiry-brief"
                  className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium"
                >
                  PROJECT BRIEF (OPTIONAL)
                </label>
                <textarea
                  id="inquiry-brief"
                  rows={4}
                  placeholder="Share details regarding objectives, timeline, deliverables, or brand context..."
                  maxLength={LIMITS.briefMax}
                  aria-invalid={!!errors.details}
                  aria-describedby={errors.details ? 'brief-error' : undefined}
                  value={formData.details}
                  onChange={(e) => {
                    setFormData({ ...formData, details: e.target.value });
                    if (errors.details) setErrors((err) => ({ ...err, details: undefined }));
                  }}
                  className="w-full bg-white border border-[#E5E2DA] px-4 py-3.5 text-xs text-[#202020] focus:outline-none focus:border-[#202020] resize-none leading-relaxed transition-colors"
                />
                {errors.details && (
                  <p
                    id="brief-error"
                    role="alert"
                    className="font-mono text-[10px] text-[#D9381E] uppercase tracking-wider flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.details}</span>
                  </p>
                )}
              </div>

              {formError && (
                <p
                  role="alert"
                  className="font-mono text-[10px] text-[#D9381E] uppercase tracking-wider flex items-center space-x-1"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formError}</span>
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`w-full py-4 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2 border border-[#202020] ${
                  status === 'submitting'
                    ? 'bg-[#444444] text-[#CCCCCC] cursor-not-allowed'
                    : 'bg-[#202020] hover:bg-[#000000] text-[#F5F3EE] cursor-pointer shadow-sm group'
                }`}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>SENDING INQUIRY...</span>
                  </>
                ) : (
                  <>
                    <span>SEND INQUIRY</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : status === 'success' ? (
            /* SUCCESS VIEW */
            <div
              role="alert"
              aria-live="polite"
              className="py-12 px-4 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-14 h-14 bg-[#202020] text-[#F5F3EE] flex items-center justify-center rounded-none shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-3 max-w-md">
                <span className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                  INQUIRY // RECEIVED
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020]">
                  THANK YOU{submittedName ? `, ${submittedName.toUpperCase()}` : ''}!
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#555555] uppercase tracking-widest leading-relaxed font-light pt-2">
                  YOUR INQUIRY HAS BEEN RECEIVED. OUR TEAM WILL REVIEW YOUR PROJECT DETAILS AND GET IN TOUCH.
                </p>
              </div>

              <button
                type="button"
                onClick={resetFormAndClose}
                className="px-10 py-4 bg-[#202020] text-[#F5F3EE] font-sans text-xs font-medium tracking-widest uppercase hover:bg-black transition-colors cursor-pointer border border-[#202020]"
              >
                CLOSE
              </button>
            </div>
          ) : (
            /* ERROR VIEW */
            <div
              role="alert"
              aria-live="polite"
              className="py-12 px-4 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-14 h-14 bg-[#D9381E] text-[#FFFFFF] flex items-center justify-center rounded-none shadow-sm">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-3 max-w-md">
                <span className="font-mono text-[10px] text-[#D9381E] uppercase tracking-widest block font-medium">
                  DELIVERY NOTICE
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020]">
                  SOMETHING WENT WRONG.
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#555555] uppercase tracking-widest leading-relaxed font-light pt-2">
                  PLEASE EMAIL US DIRECTLY AT{' '}
                  <a
                    href="mailto:enquiryfoldstudio@gmail.com"
                    className="text-[#202020] border-b border-[#202020] font-medium hover:opacity-70 transition-opacity"
                  >
                    ENQUIRYFOLDSTUDIO@GMAIL.COM
                  </a>
                </p>
                {apiErrorMessage && (
                  <p className="font-mono text-[10px] text-[#8E8B82] bg-white border border-[#E5E2DA] p-3 mt-2">
                    {apiErrorMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="w-full py-4 bg-[#202020] text-[#F5F3EE] font-sans text-xs font-medium tracking-widest uppercase hover:bg-black transition-colors cursor-pointer border border-[#202020]"
                >
                  TRY AGAIN
                </button>
                <a
                  href="mailto:enquiryfoldstudio@gmail.com"
                  className="w-full py-4 bg-white text-[#202020] border border-[#E5E2DA] hover:border-[#202020] font-sans text-xs font-medium tracking-widest uppercase transition-colors text-center"
                >
                  EMAIL DIRECTLY
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectModal;
