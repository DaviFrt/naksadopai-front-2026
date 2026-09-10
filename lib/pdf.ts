import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AVULSA_SHIRT_SIZES,
  SHIRT_SIZE_LABEL,
  type AvulsaShirtSize,
  type ChurchReport,
  type ChurchReportParticipant,
  type Gender,
  type ShirtOrder,
} from "@/lib/api";

const GENDER_LABEL: Record<Gender, string> = { MALE: "Masculino", FEMALE: "Feminino" };

const CONFIRMED_ORDER_STATUSES = new Set(["PENDING", "PAID", "EXEMPT", "SHIRT_CONFIRMED"]);

// public/logo.png é 245x44px — mantém a proporção ao desenhar no PDF.
const LOGO_URL = "/logo.png";
const LOGO_WIDTH_MM = 45;
const LOGO_HEIGHT_MM = LOGO_WIDTH_MM * (44 / 245);
const CONTENT_START_Y = 38;

let logoDataUrlPromise: Promise<string | null> | null = null;

function loadLogoDataUrl(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(LOGO_URL)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          }),
      )
      .catch(() => null);
  }
  return logoDataUrlPromise;
}

function sizeIndex(size: AvulsaShirtSize): number {
  const i = AVULSA_SHIRT_SIZES.indexOf(size);
  return i === -1 ? AVULSA_SHIRT_SIZES.length : i;
}

function sizeIndexOrNull(size: AvulsaShirtSize | null): number {
  return size ? sizeIndex(size) : Number.MAX_SAFE_INTEGER;
}

function bySizeThenName<T extends { shirtSize: AvulsaShirtSize | null; name: string }>(
  a: T,
  b: T,
): number {
  const bySize = sizeIndexOrNull(a.shirtSize) - sizeIndexOrNull(b.shirtSize);
  return bySize !== 0 ? bySize : a.name.localeCompare(b.name, "pt-BR");
}

function today(): string {
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function drawHeader(doc: jsPDF, title: string, logoDataUrl: string | null) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", 14, 10, LOGO_WIDTH_MM, LOGO_HEIGHT_MM);
    } catch {
      // segue sem o logo se a imagem não puder ser decodificada
    }
  }
  doc.setFontSize(16);
  doc.text(title, 14, 26);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${today()}`, 14, 32);
  doc.setTextColor(0);
}

async function newDoc(title: string): Promise<jsPDF> {
  const logoDataUrl = await loadLogoDataUrl();
  const doc = new jsPDF();
  drawHeader(doc, title, logoDataUrl);
  return doc;
}

function download(doc: jsPDF, filename: string) {
  doc.save(filename);
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
}

export async function downloadChurchPdf(church: ChurchReport) {
  const doc = await newDoc(`Igreja ${church.name} — Lista de participantes`);

  const rows = [...church.participants]
    .sort(bySizeThenName)
    .map((p) => [p.name, GENDER_LABEL[p.gender], p.shirtSize ? SHIRT_SIZE_LABEL[p.shirtSize] : "—"]);

  autoTable(doc, {
    startY: CONTENT_START_Y,
    head: [["Nome", "Gênero", "Camisa"]],
    body: rows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [180, 120, 70] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(10);
  doc.text(`Total: ${church.participants.length}`, 14, finalY + 8);

  download(doc, `igreja-${slug(church.name)}.pdf`);
}

export async function downloadShirtOrdersPdf(shirtOrders: ShirtOrder[]) {
  const doc = await newDoc("Camisetas avulsas — Lista para conferência");

  const items = shirtOrders
    .filter((order) => CONFIRMED_ORDER_STATUSES.has(order.status))
    .flatMap((order) => order.items)
    .sort(bySizeThenName);

  const rows = items.map((item) => [item.name, GENDER_LABEL[item.gender], SHIRT_SIZE_LABEL[item.shirtSize]]);

  autoTable(doc, {
    startY: CONTENT_START_Y,
    head: [["Nome", "Gênero", "Camisa"]],
    body: rows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [180, 120, 70] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(10);
  doc.text(`Total: ${items.length}`, 14, finalY + 8);

  download(doc, "camisetas-avulsas.pdf");
}

interface NamedShirtEntry {
  name: string;
  shirtSize: AvulsaShirtSize;
}

export async function downloadGeneralShirtsPdf(churches: ChurchReport[], shirtOrders: ShirtOrder[]) {
  const title = "Lista geral de camisetas";
  const logoDataUrl = await loadLogoDataUrl();
  const doc = new jsPDF();
  drawHeader(doc, title, logoDataUrl);

  const byGender: Record<Gender, NamedShirtEntry[]> = { MALE: [], FEMALE: [] };

  for (const church of churches) {
    for (const p of church.participants as ChurchReportParticipant[]) {
      if (!p.shirtSize) continue;
      byGender[p.gender].push({ name: p.name, shirtSize: p.shirtSize });
    }
  }

  for (const order of shirtOrders) {
    if (order.status !== "PAID" && order.status !== "EXEMPT") continue;
    for (const item of order.items) {
      byGender[item.gender].push({ name: item.name, shirtSize: item.shirtSize });
    }
  }

  (["MALE", "FEMALE"] as Gender[]).forEach((gender, index) => {
    const entries = [...byGender[gender]].sort(bySizeThenName);

    if (index > 0) {
      doc.addPage();
      drawHeader(doc, title, logoDataUrl);
    }

    doc.setFontSize(13);
    doc.text(`${GENDER_LABEL[gender]} — ${entries.length}`, 14, CONTENT_START_Y);

    const counts = AVULSA_SHIRT_SIZES.filter((size) => entries.some((e) => e.shirtSize === size))
      .map(
        (size) =>
          `${SHIRT_SIZE_LABEL[size]}: ${entries.filter((e) => e.shirtSize === size).length}`,
      )
      .join("   ");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(counts, 14, CONTENT_START_Y + 6);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: CONTENT_START_Y + 11,
      head: [["Nome", "Camisa"]],
      body: entries.map((e) => [e.name, SHIRT_SIZE_LABEL[e.shirtSize]]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [180, 120, 70] },
    });
  });

  download(doc, "camisetas-geral.pdf");
}
