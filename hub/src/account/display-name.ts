export function displayNameFromEmail(email: string): string {
  const localPart = email.split("@")[0]?.trim() ?? "";
  const words = localPart
    .replace(/[._+-]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1));

  if (words.length === 0) {
    return email;
  }

  return words.join(" ");
}
