import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { I as cn } from "./router-MkaizW1V.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
async function extractFileText(file) {
	const name = file.name.toLowerCase();
	if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
		const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
		const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
		return workbook.SheetNames.map((sheetName) => {
			const sheet = workbook.Sheets[sheetName];
			return `## ${sheetName}\n${sheet ? XLSX.utils.sheet_to_csv(sheet) : ""}`.trim();
		}).join("\n\n").slice(0, 2e4);
	}
	if (file.type.startsWith("text/") || /\.(csv|txt|md|json|tsv)$/i.test(file.name)) return (await file.text()).slice(0, 2e4);
	return `(Attached file: ${file.name}${file.type ? ` · ${file.type}` : ""})`;
}
function suggestTitleFromFile(file) {
	return file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			const comma = result.indexOf(",");
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("Could not read file"));
		reader.readAsDataURL(file);
	});
}
function downloadBase64(filename, mime, base64) {
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
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("flex h-10 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground shadow-panel transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { suggestTitleFromFile as a, fileToBase64 as i, downloadBase64 as n, extractFileText as r, Input as t };
