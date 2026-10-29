import type { GiftRequest } from "../../domain/gift-request/giftRequest";
import type { SlipperColorSection } from "../../domain/slipper/slipperConfiguration";
import { getYarnColorById } from "../../domain/slipper/yarnCatalogue";

const COLOR_LABELS: Record<SlipperColorSection, string> = {
  stripe1: "Stripe 1",
  stripe2: "Stripe 2",
  ankle: "Ankle",
  sole: "Sole",
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function safeSubjectName(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function renderColorRows(request: GiftRequest) {
  return Object.entries(request.configuration.colors).map(
    ([section, colorId]) => {
      const color = getYarnColorById(colorId);
      return {
        label: COLOR_LABELS[section as SlipperColorSection],
        value: `DROPS Snow ${color.id} · ${color.name}`,
      };
    },
  );
}

export interface GiftRequestEmailContent {
  subject: string;
  html: string;
  text: string;
}

export function renderGiftRequestEmail(
  request: GiftRequest,
): GiftRequestEmailContent {
  const colorRows = renderColorRows(request);
  const whatsapp = request.requester.whatsappPhone ?? "Not supplied";
  const message = request.christmasMessage ?? "No message supplied";
  const subject = `🎄 New Christmas Slippers wish — ${safeSubjectName(request.configuration.recipientName)}`;

  const detailRows = [
    ["Recipient", request.configuration.recipientName],
    ["EU shoe size", `EU ${request.configuration.euSize}`],
    ...colorRows.map(({ label, value }) => [label, value]),
  ];

  const htmlRows = detailRows
    .map(
      ([label, value]) => `
        <tr>
          <th align="left" style="padding:8px 12px;color:#7d6322;font-size:12px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #eadfca">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;color:#253f31;border-bottom:1px solid #eadfca">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const htmlMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7eedc;color:#3f342f;font-family:Arial,sans-serif">
    <main style="max-width:640px;margin:0 auto;padding:32px 20px">
      <section style="background:#fffaf0;border:1px solid #c9a84c;border-radius:20px;overflow:hidden">
        <header style="background:#8f2f3d;color:#fffaf0;padding:24px 28px">
          <p style="margin:0 0 6px;color:#e5c86b;font-size:12px;letter-spacing:.16em;text-transform:uppercase">Christmas Slippers workshop</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:28px">A new slipper wish has arrived</h1>
        </header>
        <div style="padding:26px 28px">
          <h2 style="margin:0 0 12px;color:#8f2f3d;font-family:Georgia,serif">The slipper design</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse">${htmlRows}</table>

          <h2 style="margin:28px 0 12px;color:#8f2f3d;font-family:Georgia,serif">Requester contact</h2>
          <p style="margin:6px 0"><strong>Name:</strong> ${escapeHtml(request.requester.name)}</p>
          <p style="margin:6px 0"><strong>Email:</strong> ${escapeHtml(request.requester.email)}</p>
          <p style="margin:6px 0"><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
          <p style="margin:12px 0 0;color:#5f6f65;font-size:13px">Consent recorded for manual contact about this specific Christmas wish${request.requester.whatsappPhone ? ", including via WhatsApp" : ""}.</p>

          <h2 style="margin:28px 0 12px;color:#8f2f3d;font-family:Georgia,serif">Christmas message</h2>
          <p style="margin:0;padding:16px;background:#f7eedc;border-radius:12px;line-height:1.6">${htmlMessage}</p>
        </div>
      </section>
      <p style="margin:18px 4px 0;color:#756a62;font-size:12px;line-height:1.5">Contact details were supplied only for communication about this request. The provider accepting this notification does not confirm final delivery or guarantee that the slippers will be made.</p>
    </main>
  </body>
</html>`;

  const text = [
    "CHRISTMAS SLIPPERS — NEW GIFT REQUEST",
    "",
    "SLIPPER DESIGN",
    ...detailRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "REQUESTER CONTACT",
    `Name: ${request.requester.name}`,
    `Email: ${request.requester.email}`,
    `WhatsApp: ${whatsapp}`,
    `Consent: Manual contact about this specific Christmas wish${request.requester.whatsappPhone ? ", including via WhatsApp" : ""}.`,
    "",
    "CHRISTMAS MESSAGE",
    message,
    "",
    "Contact details are for communication about this request only.",
    "Provider acceptance does not confirm final delivery or guarantee the slippers will be made.",
  ].join("\n");

  return { subject, html, text };
}

