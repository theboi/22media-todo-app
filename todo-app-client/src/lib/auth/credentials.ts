export type Credentials = { email: string; password: string; confirmation: string };
export function validateCredentials(credentials: Credentials, signUp: boolean): string | undefined {
  const email = credentials.email.trim();
  if (!email) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+$/.test(email) || email.length > 254) return "Enter a valid email address.";
  if (credentials.password.length < 8) return "Use a password with at least 8 characters.";
  if (credentials.password.length > 128) return "Use a password with no more than 128 characters.";
  if (signUp && !credentials.confirmation) return "Confirm your password.";
  if (signUp && credentials.confirmation !== credentials.password) return "The passwords do not match.";
  return undefined;
}
