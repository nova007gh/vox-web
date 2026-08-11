"use client";

import { useEffect } from "react";

/**
 * Suppresses unhandled runtime errors thrown by browser extensions
 * (e.g. MetaMask's inpage.js) so they don't trigger Next.js error overlays.
 *
 * This does NOT suppress errors from the app's own code — only errors
 * originating from chrome-extension:// URLs.
 */
export default function ExtensionErrorHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const isExtensionError = (stack?: string) => {
      if (!stack) return false;
      return (
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        stack.includes("safari-web-extension://") ||
        stack.includes("inpage.js")
      );
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (isExtensionError(event.error?.stack || event.message)) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const stack =
        reason?.stack || (typeof reason === "string" ? reason : "");
      if (isExtensionError(stack)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("error", handleWindowError, true);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
      true
    );

    return () => {
      window.removeEventListener("error", handleWindowError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        true
      );
    };
  }, []);

  return <>{children}</>;
}
