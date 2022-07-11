/* eslint-disable */
import { z } from 'zod';

export const ReCAPTCHAProps = z.object({
    siteKey: z.string(),
    actionName: z.string(),
    buttonClass: z.string(),
    buttonText: z.string(),
    isDisabled: z.boolean(),
    isLoading: z.boolean(),
    onClick: z.function(),
    brandingRichText: z.string(),
});
