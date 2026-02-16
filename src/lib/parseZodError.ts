import { ZodError } from "zod";

export const parseZodError = (error: ZodError): string => {
  return error.issues[0].message;
};
