/* eslint-disable */
import { z } from 'zod';

import { ReCAPTCHAProps } from './Recaptcha.mjs';

const ContactFormProps = z.object({
  contactFormWarningMsg: z.string(),
  contactFormSuccessMsg: z.string(),
  linkTxtPrivacyRecruting: z.string(),
  consentHeader: z.string(),
  contactFormHeader: z.string(),
  consentTxt: z.string(),
  checkBoxLabel: z.string(),
  linkPrivacyRecruting: z.string(),
  eventGuid: z.string(),
  displayNameLabel: z.string(),
  emailLabel: z.string(),
  zipCodeLabel: z.string(),
  officeZipCode: z.string(),
  phoneLabel: z.string(),
  apiUrlPostContactForm: z.string(),
  requestType: z.number(),
  siteKey: z.string(),
  actionName: z.string(),
  submitButtonClass: z.string(),
  buttonText: z.string(),
  timeId: z.string(),
  eventName: z.string(),
  region: z.string(),
  eventFormat: z.string(),
  recaptchaBrandingRichText: z.string(),
  isRecipientROS: z.boolean(),
  recipientEmail: z.string(),
}).partial({
  contactFormHeader: true,
  eventGuid: true,
  zipCodeLabel: true,
  officeZipCode: true,
  requestType: true,
  timeId: true,
  eventName: true,
  region: true,
  isRecipientROS: true,
  recipientEmail: true,
}).omit({
  siteKey: true,
  actionName: true,
  recaptchaBrandingRichText: true,
  submitButtonClass: true,
  buttonText: true
}).extend({
  sendButtonProps: ReCAPTCHAProps,
});

export {
  ReCAPTCHAProps,
  ContactFormProps,
}