import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (
  data,
  fileName = "export.xlsx",
  sheetName = "Sheet1"
) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn("Dữ liệu không hợp lệ hoặc rỗng.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const columnWidths = Object.keys(data[0]).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => (row[key] ? row[key].toString().length : 0))
    );
    return { wch: maxLength + 2 };
  });
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });
  saveAs(blob, fileName);
};

const exportMultipleSheetsToExcel = (
  sheets,
  fileName = "MultiSheetExport.xlsx"
) => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = Object.keys(data[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxLength + 2 };
    });
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, fileName);
};

export { exportToExcel, exportMultipleSheetsToExcel };
