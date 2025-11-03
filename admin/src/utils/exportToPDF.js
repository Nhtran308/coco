import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../public/icon_coco.png";
import "../fonts/Roboto-Regular-normal";

export const createPDFDocument = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("Roboto-Regular", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN");
  const timeStr = now.toLocaleTimeString("vi-VN");

  const header = () => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);

    doc.addImage(logo, "PNG", 14, 12, 18, 18);
    doc.setFontSize(16);
    doc.text("BÁO CÁO SỐ LIỆU THỐNG KÊ", pageWidth / 2, 22, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${dateStr} ${timeStr}`, pageWidth - 60, 28);

    doc.line(14, 30, pageWidth - 14, 30);
  };

  const footer = () => {
    const str = "Trang " + doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setFont("Roboto-Regular", "normal");
    doc.setTextColor(150);

    doc.text("BÁO CÁO SỐ LIỆU THỐNG KÊ", 14, pageHeight - 14);
    doc.text(str, pageWidth - 14, pageHeight - 14, { align: "right" });

    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
  };

  return { doc, header, footer };
};

export const addTable = (
  doc,
  data,
  title,
  header,
  footer,
  columnOrder,
  columnMapping,
  isLastTable = true
) => {
  if (!data || data.length === 0) return;

  const headers =
    columnOrder && columnMapping
      ? [columnOrder.map((key) => columnMapping[key] || key)]
      : [Object.keys(data[0])];

  const body = data.map((row) =>
    columnOrder ? columnOrder.map((key) => row[key]) : Object.values(row)
  );

  const yPos = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 24 : 46;

  doc.setFontSize(12);
  doc.setFont("Roboto-Regular", "normal");
  doc.text(
    `TỔNG HỢP DỮ LIỆU ${title.toUpperCase()}`,
    doc.internal.pageSize.getWidth() / 2,
    yPos - 10,
    { align: "center" }
  );

  autoTable(doc, {
    head: headers,
    body: body,
    startY: yPos,
    margin: { top: 35, bottom: 30 },
    styles: {
      font: "Roboto-Regular",
      fontStyle: "normal",
      fontSize: 10,
      halign: "center",
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawPage: () => {
      header();
      footer();
    },
  });

  if (isLastTable) {
    const signatureHeight = 40;
    const pageHeight = doc.internal.pageSize.getHeight();
    const spaceLeft = pageHeight - doc.lastAutoTable.finalY;

    if (spaceLeft < signatureHeight) {
      doc.addPage();
    }

    const y = spaceLeft < signatureHeight ? 30 : doc.lastAutoTable.finalY + 10;

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(11);
    doc.setFont("Roboto-Regular", "normal");

    doc.text(
      `TP. Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${
        new Date().getMonth() + 1
      } năm ${new Date().getFullYear()}`,
      pageWidth - 14,
      y,
      { align: "right" }
    );

    doc.text("TỔNG GIÁM ĐỐC", pageWidth - 160, y + 10, { align: "center" });
    doc.text("QUẢN LÝ", pageWidth - 40, y + 10, { align: "center" });

    doc.setFontSize(10);
    doc.text("(Ký, ghi rõ họ tên)", pageWidth - 160, y + 17, {
      align: "center",
    });
    doc.text("(Ký, ghi rõ họ tên)", pageWidth - 40, y + 17, {
      align: "center",
    });
  }
};

const exportPDF = (
  data,
  title = "Báo cáo",
  fileName = "report.pdf",
  columnOrder = null,
  columnMapping = {}
) => {
  const { doc, header, footer } = createPDFDocument();
  addTable(doc, data, title, header, footer, columnOrder, columnMapping);
  doc.save(fileName);
};

export default exportPDF;
