import { NextResponse } from "next/server";
import { google } from "googleapis";

type ServiceType = "stitching" | "embroidery" | "alteration" | "repair" | "saree";

const nowIso = () => new Date().toISOString();
const newReqId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

function parseServiceDetails(raw: any, serviceType: ServiceType) {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed?.[serviceType] || null;
    } catch (e) {
      return null;
    }
  }
  return (raw || {})?.[serviceType] || null;
}

async function parseBody(req: Request, reqId: string) {
  const ct = req.headers.get("content-type") || "";
  console.log(`[${reqId}] [PARSE] content-type=${ct}`);
  const t0 = Date.now();

  if (ct.includes("application/json")) {
    const data = await req.json();
    console.log(`[${reqId}] [PARSE] json parsed keys=`, Object.keys(data || {}));
    console.log(`[${reqId}] [PARSE] done in ${Date.now()-t0}ms`);
    return { data, files: [] as File[], ct };
  }

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const obj = Object.fromEntries(form.entries());
    const files: File[] = [];
    for (const [k, v] of form.entries()) {
      if (k.startsWith("referencePhoto_") && v instanceof File) files.push(v);
    }
    console.log(`[${reqId}] [PARSE] form entries=${Object.keys(obj).length} fileCount=${files.length}`);
    console.log(`[${reqId}] [PARSE] done in ${Date.now()-t0}ms`);
    return { data: obj as Record<string, any>, files, ct };
  }

  throw new Error(`Unsupported content-type: ${ct}`);
}

function validate(data: any, reqId: string) {
  console.log(`[${reqId}] [VALIDATE] start`);
  const { name, phone, serviceType, pickupDate, timeWindow, pickupMethod } = data;

  if (!name || !phone || !serviceType || !pickupDate || !timeWindow || !pickupMethod) {
    return "Missing required fields";
  }
  if (pickupMethod === "pickup-from-home" && !data.pickupAddress) {
    return "Pickup address is required for home pickup";
  }

  const serviceDetails = parseServiceDetails(data.serviceDetails, serviceType);
  if (!serviceDetails) return "Service-specific details are required";

  switch (serviceType as ServiceType) {
    case "stitching":
      if (!serviceDetails.garmentType || !serviceDetails.fabricType)
        return "Garment type and fabric type are required for stitching";
      break;
    case "embroidery":
      if (!serviceDetails.embroideryType || !serviceDetails.placement)
        return "Embroidery type and placement are required";
      break;
    case "alteration":
      if (!serviceDetails.garmentType || !Array.isArray(serviceDetails.changes) || !serviceDetails.changes.length)
        return "Garment type and changes are required for alterations";
      break;
    case "repair":
      if (!serviceDetails.issueType || !serviceDetails.area)
        return "Issue type and area are required for repairs";
      break;
    case "saree":
      if (!serviceDetails.type || !serviceDetails.material)
        return "Type and material are required for saree work";
      break;
  }

  console.log(`[${reqId}] [VALIDATE] ok`);
  return null;
}

console.log("Env present:", {
  sheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  email: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY
});

function getSheetsClient(reqId: string) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  console.log(`[${reqId}] [SHEETS] envs: email=${!!email} key=${!!key} sheetId=${!!spreadsheetId}`);
  if (!email || !key || !spreadsheetId) {
    return { client: null, spreadsheetId };
  }

  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = google.sheets({ version: "v4", auth });
  console.log(`[${reqId}] [SHEETS] client created`);
  return { client, spreadsheetId };
}

export async function POST(request: Request) {
  const reqId = newReqId();
  const started = Date.now();
  console.log(`[${reqId}] ===== START POST ${nowIso()} =====`);

  const ct = request.headers.get("content-type") || "";
  try {
    // 1) Parse
    const { data, files } = await parseBody(request, reqId);

    // 2) Normalise
    data.phone = String(data.phone || "");
    data.name = String(data.name || "");
    data.email = data.email ? String(data.email) : "";
    console.log(`[${reqId}] [NORMALISE] name="${data.name}" phone="${data.phone}" email="${data.email}"`);

    // 3) Validate
    const validationError = validate(data, reqId);
    if (validationError) {
      console.warn(`[${reqId}] [VALIDATE] error=${validationError}`);
      return NextResponse.json({ error: validationError, detail: "validation" }, { status: 400 });
    }

    // 4) Prepare data for storage
    const serviceType = data.serviceType as ServiceType;
    const serviceDetails = parseServiceDetails(data.serviceDetails, serviceType);
    console.log(`[${reqId}] [PAYLOAD] serviceType=${serviceType} detailsKeys=${Object.keys(serviceDetails || {}).join(",")}`);

    console.log(`[${reqId}] [ENQUIRY]`, {
      customer: { name: data.name, phone: data.phone, email: data.email },
      service: { type: serviceType, urgency: data.urgency },
      pickup: {
        method: data.pickupMethod,
        date: data.pickupDate,
        timeWindow: data.timeWindow,
        address: data.pickupAddress || "",
      },
      photoCount: files.length,
      ct,
    });

    // 5) Google Sheets append (optional)
    const { client: sheets, spreadsheetId } = getSheetsClient(reqId);
    if (sheets && spreadsheetId) {
      const row = [
        new Date().toISOString(),
        data.name,
        data.phone,
        data.email,
        data.cityArea || "",
        serviceType,
        data.pickupMethod,
        data.pickupAddress || "",
        data.pickupDate,
        data.timeWindow,
        data.urgency || "",
        JSON.stringify(serviceDetails || {}),
        files.map((f) => f.name).join(", "),
        data.notes || "",
      ];

      const range = "Sheet1!A:Z"; // change if your tab name differs
      console.log(`[${reqId}] [SHEETS] append start -> range=${range}`);
      const tAppend = Date.now();
      try {
        const res = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [row] },
        });
        console.log(
          `[${reqId}] [SHEETS] append ok status=${res.status} in ${Date.now() - tAppend}ms`
        );
      } catch (sheetErr: any) {
        const apiErr = sheetErr?.response?.data || sheetErr?.message || sheetErr;
        console.error(`[${reqId}] [SHEETS] append FAILED:`, apiErr);
        return NextResponse.json(
          { error: "Sheets append failed", detail: "sheets-append", info: apiErr },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        `[${reqId}] [SHEETS] skipped: client=${!!sheets} spreadsheetId=${spreadsheetId}`
      );
    }

    // 6) Success
    console.log(`[${reqId}] [DONE] total=${Date.now() - started}ms`);
    return NextResponse.json({
      message: "Enquiry submitted successfully",
      enquiryId: `ENQ-${Date.now()}`,
      service: serviceType,
      pickupDate: data.pickupDate,
      urgency: data.urgency || "Regular",
      estimatedResponse: "We'll contact you within 24 hours to confirm details",
      _reqId: reqId,
    });
  } catch (error: any) {
    // Attempt to read raw body only for debugging
    let raw = "";
    try { raw = await request.text(); } catch {}
    console.error(
      `[${reqId}] [ERROR]`,
      error?.message || error,
      "CT:",
      ct,
      "RAW(len):",
      raw?.length ?? 0
    );
    console.log(`[${reqId}] [DONE with ERROR] total=${Date.now() - started}ms`);
    return NextResponse.json(
      { error: "Internal server error", detail: "unhandled", _reqId: reqId },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "enquiry API up" });
}
