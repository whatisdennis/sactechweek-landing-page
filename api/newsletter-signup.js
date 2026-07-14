const AUDIENCE_ID = "9984b865-e238-409c-8367-b33327af5197";
const RESEND_CONTACTS_URL = `https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setResponseHeaders(req, res) {
  const origin = req.headers.origin;
  const host = req.headers.host;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Vary", "Origin");

  // Only explicitly grant CORS access when the request origin matches this host.
  if (origin && host) {
    try {
      if (new URL(origin).host === host) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
    } catch {
      // Invalid Origin headers receive no CORS grant.
    }
  }
}

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function getRequestBody(body) {
  if (typeof body !== "string") return body || {};

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function getResendErrorMessage(payload, fallback) {
  if (typeof payload === "object" && payload) {
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  }

  return fallback;
}

export default async function handler(req, res) {
  setResponseHeaders(req, res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed." });
  }

  const { email, website } = getRequestBody(req.body);

  // Pretend to succeed so bots cannot distinguish this endpoint from a real signup.
  if (typeof website === "string" && website.trim()) {
    return sendJson(res, 200, {
      success: true,
      message: "You're in. Watch your inbox.",
    });
  }

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return sendJson(res, 400, {
      success: false,
      error: "Enter a valid email address.",
    });
  }

  if (!process.env.RESEND_API_KEY) {
    return sendJson(res, 500, {
      success: false,
      error: "Newsletter signup is temporarily unavailable. Please try again later.",
    });
  }

  try {
    const resendResponse = await fetch(RESEND_CONTACTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const responseText = await resendResponse.text();
    let responseBody = null;
    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      // A non-JSON upstream response still receives a graceful JSON response.
    }

    if (!resendResponse.ok) {
      const status = resendResponse.status >= 400 && resendResponse.status < 600
        ? resendResponse.status
        : 502;
      return sendJson(res, status, {
        success: false,
        error: getResendErrorMessage(
          responseBody,
          "We couldn't add you to the newsletter. Please try again shortly."
        ),
      });
    }

    return sendJson(res, 200, {
      success: true,
      message: "You're in. Watch your inbox.",
    });
  } catch {
    return sendJson(res, 502, {
      success: false,
      error: "We couldn't reach the newsletter service. Please try again shortly.",
    });
  }
}
