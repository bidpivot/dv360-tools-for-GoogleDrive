function getFormattedDate(): string {
  const date = new Date();
  const year = date.getFullYear(); // 2024
  const month = String(date.getMonth() + 1).padStart(2, "0"); // '08'
  const day = String(date.getDate()).padStart(2, "0"); // '03'
  console.log(`${year}${month}${day}`);
  return `${year}${month}${day}`; // '20240803'
}
