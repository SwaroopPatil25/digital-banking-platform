export const generateAccountNumber = (): string => {
  const prefix = "BFSI";
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `${prefix}${randomDigits}`;
};
