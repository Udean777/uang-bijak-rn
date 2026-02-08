export const getErrorMessage = (
  error: unknown,
  fallback: string = "Terjadi kesalahan yang tidak diketahui",
): string => {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, string>).message;
  }

  return fallback;
};
