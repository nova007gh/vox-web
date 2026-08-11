"use client";

import { useEffect } from "react";

const EXTENSION_PATTERNS = [
  "chrome-extension://",
  "moz-extension://",
  "safari-web-extension://",
  "inpage.js",
  "contentscript.js",
  "webextension-polyfill",
];

const EXTENSION_ERROR_MESSAGES = [
  "metamask",
  "failed to connect",
  "ethereum",
  "is not a function",
  "cannot read properties",
];

const isExtensionUrl = (url?: string) => {
  if (!url) return false;
  return EXTENSION_PATTERNS.some((p) => url.toLowerCase().includes(p));
};

const isExtensionStack = (stack?: string) => {
  if (!stack) return false;
  return isExtensionUrl(stack);
};

const isExtensionMessage = (message?: string) => {
  if (!message) return false;
  const lower = message.toLowerCase();
  return EXTENSION_ERROR_MESSAGES.some((m) => lower.includes(m));
};

const isExtensionError = (event: ErrorEvent) => {
  // filename is the URL of the script that threw the error
  if (isExtensionUrl(event.filename)) return true;
  // stack trace of the error
  if (isExtensionStack(event.error?.stack)) return true;
  // error message
  if (isExtensionMessage(event.message) && isExtensionStack(event.error?.stack)) return true;
  if (isExtensionMessage(event.message) && isExtensionUrl(event.filename)) return true;
  return false;
};

const isExtensionRejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  if (!reason) return false;
  const stack = reason?.stack || "";
  const message = reason?.message || (typeof reason === "string" ? reason : "");
  if (isExtensionStack(stack)) return true;
  if (isExtensionMessage(message) && isExtensionStack(stack)) return true;
  return false;
};

/**
 * Suppresses unhandled runtime errors thrown by browser extensions
 * (e.g. MetaMask's inpage.js) so they don't trigger Next.js error overlays.
 *
 * This does NOT suppress errors from the app's own code — only errors
 * originating from browser extension URLs.
 */
export default function ExtensionErrorHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (isExtensionError(event)) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isExtensionRejection(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Next.js dev overlay and React use window.onerror and addEventListener
    // Register in capture phase so we get the error first
    window.addEventListener("error", handleWindowError, true);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
      true
    );

    // Also wrap window.onerror as a fallback (Next.js dev overlay uses this)
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const syntheticEvent = {
        message: String(message),
        filename: String(source),
        error,
      } as ErrorEvent;
      if (isExtensionError(syntheticEvent)) {
        return true; // suppress
      }
      if (typeof originalOnError === "function") {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      window.removeEventListener("error", handleWindowError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        true
      );
      window.onerror = originalOnError;
    };
  }, []);

  return <>{children}</>;
}
