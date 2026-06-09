export const generateCustomerId = (): string => {
  const prefix = "CUS";
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}${randomDigits}`;
};
