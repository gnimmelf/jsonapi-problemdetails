/* eslint-disable */
import { z } from 'zod';

import { ReCAPTCHAProps } from './Recaptcha.mjs';
import { ContactFormProps } from './ContactForm.mjs';

export const EventSignupProps = z.object({
    btnText: z.string(),
    modalHeader: z.string(),
    contactForm: ContactFormProps,
    recaptcha: ReCAPTCHAProps,
}).omit({
    btnText: true,
    recaptcha: true,
    contactForm: true,
}).extend({
    signupButtonText: z.string(),
    ContactFormProps: ContactFormProps,
});