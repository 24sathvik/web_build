/**
 * EmailJS Client Configuration
 * Public browser identifiers used for contact form submissions.
 * Defaults match the existing zyxen.in EmailJS setup.
 */

export const serviceId: string =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_p5gb8wg";

export const templateId: string =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_osddfod";

export const publicKey: string =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "m1xChN43puPbSRCtJ";

export const emailjsConfig = {
  serviceId,
  templateId,
  publicKey,
};

export default emailjsConfig;

