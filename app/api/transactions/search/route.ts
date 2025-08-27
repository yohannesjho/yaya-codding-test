import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BASE_URL = process.env.YAYA_BASE_URL!;
const API_KEY = process.env.YAYA_API_KEY!;
const API_SECRET = process.env.YAYA_API_SECRET!;

function signRequest(
  timestamp: string,
  method: string,
  endpoint: string,
  body: string
) {
  const preHash = `${timestamp}${method}${endpoint}${body}`;
  const hmac = crypto.createHmac("sha256", API_SECRET);
  hmac.update(preHash);
  return hmac.digest("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || "";

    const endpoint = "/api/en/transaction/search";
    const url = `${BASE_URL}${endpoint}`;

    const timestamp = (Date.now() * 1000).toString();
    const signature = signRequest(
      timestamp,
      "POST",
      endpoint,
      JSON.stringify({ query })
    );

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "YAYA-API-KEY": API_KEY,
        "YAYA-API-TIMESTAMP": timestamp,
        "YAYA-API-SIGN": signature,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "API request failed", details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to search transactions", details: err.message },
      { status: 500 }
    );
  }
}
