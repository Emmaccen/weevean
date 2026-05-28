import { CommonErrorCode } from "@/lib/types";
import { toast } from "sonner";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    data?: Record<string, unknown>;
  };
};

export class ClientError {
  public readonly code: string;
  public readonly message: string;
  public readonly data?: Record<string, unknown>;
  public readonly status?: number;

  constructor(errorResponse: unknown, status?: number) {
    let parsedError: ErrorResponse["error"] | undefined;

    // 1. Check if it's already a valid error response object
    if (this.isValidErrorResponse(errorResponse)) {
      parsedError = errorResponse.error;
    }
    // 2. Check if it's a standard Error object
    else if (errorResponse instanceof Error) {
      try {
        const parsedMessage = JSON.parse(errorResponse.message);
        if (this.isValidErrorResponse(parsedMessage)) {
          parsedError = parsedMessage.error;
        } else {
          parsedError = {
            code: "unknown_error",
            message: errorResponse.message,
          };
        }
      } catch {
        parsedError = {
          code: "unknown_error",
          message: errorResponse.message,
        };
      }
    }

    if (parsedError) {
      this.code = parsedError.code;
      this.message = parsedError.message;
      this.data = parsedError.data;
    } else {
      this.code = "unknown_error";
      this.message = "An unexpected error occurred.";
    }

    this.status = status;

    // Return a proxy to allow dynamic property access for error codes
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        if (typeof prop === "string") {
          return target.code.includes(prop);
        }
        return false;
      },
    }) as this & Record<string, boolean>;
  }

  private isValidErrorResponse(response: unknown): response is ErrorResponse {
    if (!response || typeof response !== "object") return false;

    const r = response as Record<string, unknown>;
    const error = r.error;

    if (!error || typeof error !== "object") return false;

    const e = error as Record<string, unknown>;
    return typeof e.code === "string" && typeof e.message === "string";
  }

  /**
   * Checks if the error code matches or contains the given code segment.
   */
  is(codeSegment: CommonErrorCode | (string & {})): boolean {
    return this.code.includes(codeSegment);
  }

  /**
   * Execute a specific handler based on the error code.
   */
  handle(
    handlers: Partial<Record<CommonErrorCode | (string & {}), () => void>>,
    defaultHandler?: () => void,
  ): void {
    // 1. Try exact match
    const exactMatch = handlers[this.code as keyof typeof handlers];
    if (exactMatch) {
      exactMatch();
      return;
    }

    // 2. Try partial match
    for (const key in handlers) {
      if (
        Object.prototype.hasOwnProperty.call(handlers, key) &&
        this.code.includes(key)
      ) {
        const handler = handlers[key as keyof typeof handlers];
        if (handler) {
          handler();
          return;
        }
      }
    }

    // 3. Fallback
    if (defaultHandler) {
      defaultHandler();
    }
  }
  // handle all defaults with a toast message
  handleAllCommonErrorsWithToast(message?: string) {
    toast.error(
      this.message ?? "Oops! Something went wrong. Let's try that again.",
    );
  }
}
