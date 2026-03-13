export const PASSWORD_POLICY_MESSAGE =
  "Password must be 8-64 characters and include uppercase, lowercase, number, and special character.";

const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/;

export const getPasswordPolicyError = (password: string): string | null => {
  const value = String(password || "");
  if (!PASSWORD_POLICY_REGEX.test(value)) {
    return PASSWORD_POLICY_MESSAGE;
  }
  return null;
};

