export const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;

export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const chunks = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = sheet ? XLSX.utils.sheet_to_csv(sheet) : "";
      return `## ${sheetName}\n${csv}`.trim();
    });
    return chunks.join("\n\n").slice(0, 20000);
  }
  if (
    file.type.startsWith("text/") ||
    /\.(csv|txt|md|json|tsv)$/i.test(file.name)
  ) {
    return (await file.text()).slice(0, 20000);
  }
  return `(Attached file: ${file.name}${file.type ? ` · ${file.type}` : ""})`;
}

export function suggestTitleFromFile(file: File): string {
  return file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function downloadBase64(filename: string, mime: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}