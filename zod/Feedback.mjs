/* eslint-disable */
import { z } from 'zod';

import { ReCAPTCHAProps } from './Recaptcha.mjs';

export const FeedbackProps = z.object({
  apiUrl: z.string(),
  page: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  }),
  heading: z.string(),
  feedbackTextMinLength: z.number(),
  feedbackTextMaxLength: z.number(),
  positiveButtonText: z.string(),
  positiveHeader: z.string(),
  positiveBody: z.string(),
  negativeButtonText: z.string(),
  negativeHeader: z.string(),
  negativeBody: z.string(),
  negativeFeedbackInputLabel: z.string(),
  sendButton: ReCAPTCHAProps,
  negativeFeedbackSentHeader: z.string(),
  negativeFeedbackSentBody: z.string(),
  requestFailedText: z.string(),
  siteRegion: z.string(),
}).partial({
  feedbackTextMinLength: true,
  feedbackTextMaxLength: true,
  requestFailedText: true,
})