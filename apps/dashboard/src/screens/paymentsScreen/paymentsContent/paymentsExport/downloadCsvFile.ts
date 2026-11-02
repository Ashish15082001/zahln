/**
 * Hands the text to the browser as a CSV file to save. The link is made for
 * the click and removed at once; React never renders it, so nothing it shows
 * changes behind its back.
 */
export const downloadCsvFile = (fileName: string, csvText: string): void => {
  // A byte order mark first, so Excel reads the file as UTF-8 and shows
  // umlauts as they are rather than as two odd characters each.
  const file = new Blob(["﻿", csvText], {
    type: "text/csv;charset=utf-8",
  });
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Freed on the next task, once the browser has started saving it.
  setTimeout(() => URL.revokeObjectURL(fileUrl), 0);
};
