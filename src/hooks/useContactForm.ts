"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { siteContent } from "@/content/site";
import { trackEvent } from "@/lib/analytics";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  service: string;
  budget: string;
  message: string;
  honeypot: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

export type FormStatus = "idle" | "submitting" | "success" | "error";

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  service: "",
  budget: "",
  message: "",
  honeypot: "",
};

export function useContactForm(onSuccessCallback?: () => void) {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message or project requirements.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check: silently accept bot submissions without sending or wasting quota
    if (formData.honeypot) {
      setStatus("success");
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      return;
    }

    if (!validate()) {
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    // Fail gracefully if keys are not configured in environment
    if (!serviceId || !templateId || !publicKey) {
      setStatus("error");
      setErrorMessage(
        `Email service configuration is pending. Please contact us directly at ${siteContent.contact.email}`
      );
      return;
    }

    try {
      const trimmedName = formData.name.trim();
      const nameParts = trimmedName.split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const details = [
        formData.organisation.trim() ? `Organisation: ${formData.organisation.trim()}` : null,
        formData.service.trim() ? `Interested in: ${formData.service.trim()}` : null,
        formData.budget.trim() ? `Estimated Budget: ${formData.budget.trim()}` : null,
      ].filter(Boolean);

      const fullMessage =
        details.length > 0
          ? `${details.join("\n")}\n\nMessage:\n${formData.message.trim()}`
          : formData.message.trim();

      const templateParams = {
        firstName,
        lastName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: fullMessage,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      trackEvent("contact_submit", {
        form_id: "contact_form",
        has_organisation: Boolean(formData.organisation.trim()),
        has_service: Boolean(formData.service.trim()),
      });

      setStatus("success");
      setFormData(initialFormData);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch {
      // Do not log keys or sensitive error payload
      setStatus("error");
      setErrorMessage(
        `Unable to send message right now. Please email us directly at ${siteContent.contact.email}`
      );
    }
  };

  return {
    formData,
    errors,
    status,
    errorMessage,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    isError: status === "error",
  };
}

