import { z } from 'zod'
import { printNode, zodToTs } from 'zod-to-ts';

import { ReCAPTCHAProps } from './Recaptcha.mjs';
import { ContactFormProps } from './ContactForm.mjs';
import { FeedbackProps } from './Feedback.mjs';
import { EventSignupProps } from './EventSignup.mjs';
import { PostalSearchModalProps } from './PostalSearchModal.mjs'

const TestSchema = z.object({
  fn: z.function().optional()
});

function log(zodObj) {
  Object.entries(zodObj).map(([k, v]) => {
    const { node } = zodToTs(v, k);
    console.log(`export type ${k}Type = ${printNode(node)}\n`);
  });
}

// -------------

log({
  // ReCAPTCHAProps,
  // ContactFormProps,
  // FeedbackProps,
  // EventSignupProps,
  // PostalSearchModalProps,
  TestSchema
});
