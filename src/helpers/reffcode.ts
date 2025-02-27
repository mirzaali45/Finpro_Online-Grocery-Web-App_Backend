export function generateReferralCode(length: number = 8): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    referralCode += charset[randomIndex];
  }

  return referralCode;
}

export function generateVoucherCode(length: number = 12): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    referralCode += charset[randomIndex];
  }

  return referralCode;
}
