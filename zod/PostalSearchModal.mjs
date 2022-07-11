/* eslint-disable */
import { z } from 'zod';

import { ReCAPTCHAProps } from './Recaptcha.mjs';
import { ContactFormProps } from './ContactForm.mjs';

export const PostalSearchModalProps = z.object({
    contactTileHeader: z.string(),
    contactTileLink: z.string(),
    contactTileLinkTxt: z.string(),
    contactTileIngress: z.string(),
    inputLabel: z.string(),
    buttonText: z.string(),
    apiUrl: z.string(),
    emptyApiResultMsg: z.string(),
    emptyEventResultMsg: z.string(),
    queryPrefix: z.string(),
    searchRequestErrorMsg: z.string(),
    accordionTitle: z.string(),
    phoneTxtBold: z.string(),
    phoneTimeTxt: z.string(),
    infoMeetingHeader: z.string(),
    infoMeetingDescriptionTxt: z.string(),
    imageUrl: z.string(),
    imageAltText: z.string(),
    contactForm: ContactFormProps,
    recaptcha: ReCAPTCHAProps,
}).omit({
    buttonText: true,
    recaptcha: true,
    contactForm: true,
}).extend({
    contactFormProps: ContactFormProps,
})