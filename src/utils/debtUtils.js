/**
 * Thuật toán tối ưu hóa nợ (Debt Simplification)
 * Đầu vào: Danh sách các giao dịch [{ debtor, creditor, amount }]
 * Đầu ra: Danh sách các giao dịch tối giản để tất cả mọi người hết nợ
 */
export const simplifyDebts = (transactions) => {
  const netBalances = {};

  // Bước 1: Tính toán số dư ròng của mỗi người
  transactions.forEach(({ debtor, creditor, amount }) => {
    netBalances[debtor] = (netBalances[debtor] || 0) - amount;
    netBalances[creditor] = (netBalances[creditor] || 0) + amount;
  });

  // Bước 2: Tách thành 2 nhóm: Người nợ (âm) và Người được nợ (dương)
  const debtors = [];
  const creditors = [];

  Object.keys(netBalances).forEach((person) => {
    if (netBalances[person] < -0.01) {
      debtors.push({ person, balance: netBalances[person] });
    } else if (netBalances[person] > 0.01) {
      creditors.push({ person, balance: netBalances[person] });
    }
  });

  const result = [];
  let i = 0;
  let j = 0;

  // Bước 3: Khớp nợ giữa 2 nhóm
  while (i < debtors.length && j < creditors.length) {
    const amountToSettle = Math.min(-debtors[i].balance, creditors[j].balance);
    
    result.push({
      from: debtors[i].person,
      to: creditors[j].person,
      amount: Math.round(amountToSettle * 100) / 100
    });

    debtors[i].balance += amountToSettle;
    creditors[j].balance -= amountToSettle;

    if (Math.abs(debtors[i].balance) < 0.01) i++;
    if (Math.abs(creditors[j].balance) < 0.01) j++;
  }

  return result;
};
