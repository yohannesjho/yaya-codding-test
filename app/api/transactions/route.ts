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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("p") || "2";

   
    const endpoint = `/api/en/transaction/find-by-user`;
    const url = `${BASE_URL}${endpoint}?page=${page}`;

    const timestamp = (Date.now() * 1000).toString();
    const signature = signRequest(timestamp, "GET", endpoint, "");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "YAYA-API-KEY": API_KEY,
        "YAYA-API-TIMESTAMP": timestamp,
        "YAYA-API-SIGN": signature,
      },
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
      { error: "Failed to fetch transactions", details: err.message },
      { status: 500 }
    );
  }
}
