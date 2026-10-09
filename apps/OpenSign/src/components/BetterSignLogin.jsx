// BetterSignLogin — "Log in with BetterSign" via phone (Experiment #2, v2).
//
// A self-contained modal that authorizes an OpenSign login on the user's phone.
// It talks to the BetterSign signing coordinator Worker (REACT_APP_BS_SIGN_URL):
//   POST /api/login/push/start { phone }
//   GET  /api/login/poll?sessionId=...   (long-poll)
// On approval the Worker verifies the phone's signature (via the native verifier)
// and mints an OpenSign Parse session token (bettersignlogin cloud function);
// `onLoggedIn(sessionToken, meta)` hands it back so Login.jsx can call
// Parse.User.become(sessionToken) through its existing thirdpartyLoginfn path.
//
// Uses the dependency-free push flow (no QR library bundled in OpenSign).

import { useRef, useState } from "react";
import ModalUi from "../primitives/ModalUi";
import { getEnv } from "../constant/Utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function signBaseUrl() {
  const env = typeof getEnv === "function" ? getEnv() : null;
  return (
    env?.REACT_APP_BS_SIGN_URL ||
    process.env.REACT_APP_BS_SIGN_URL ||
    ""
  ).replace(/\/$/, "");
}

export default function BetterSignLogin({ isOpen, onClose, onLoggedIn }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);
  const base = signBaseUrl();

  function stop() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }

  function close() {
    stop();
    setBusy(false);
    setStatus("");
    setIsError(false);
    onClose && onClose();
  }

  async function poll(sessionId) {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    while (!ctrl.signal.aborted) {
      let res, body;
      try {
        res = await fetch(
          `${base}/api/login/poll?sessionId=${encodeURIComponent(sessionId)}`,
          { signal: ctrl.signal }
        );
        body = await res.json();
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setStatus("Connection lost — retrying…");
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      if (body.status === "authorized") {
        if (!body.sessionToken) {
          setBusy(false);
          setIsError(true);
          setStatus("Signed in on phone, but no session was issued.");
          return;
        }
        setStatus("Signed in ✓");
        onLoggedIn && onLoggedIn(body.sessionToken, body);
        return;
      }
      if (body.status === "denied") {
        setBusy(false);
        setIsError(true);
        setStatus("Login was declined on the phone.");
        return;
      }
      if (body.status === "expired" || res.status === 404) {
        setBusy(false);
        setIsError(true);
        setStatus("This request expired. Please try again.");
        return;
      }
      // pending: long-poll, loop immediately.
    }
  }

  async function send() {
    if (!base) {
      setIsError(true);
      setStatus("Signing service not configured (REACT_APP_BS_SIGN_URL).");
      return;
    }
    if (!phone.trim()) return;
    setBusy(true);
    setIsError(false);
    setStatus("Sending request to your phone…");
    try {
      const res = await fetch(`${base}/api/login/push/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const body = await res.json();
      if (!res.ok || !body.sessionId) {
        setBusy(false);
        setIsError(true);
        setStatus(
          body.error || "Could not send the request. Is this number registered?"
        );
        return;
      }
      setStatus("Request sent — approve it on your phone…");
      poll(body.sessionId);
    } catch (e) {
      setBusy(false);
      setIsError(true);
      setStatus("Error: " + (e?.message || e));
    }
  }

  if (!isOpen) return null;

  return (
    <ModalUi
      isOpen={isOpen}
      title="Log in with BetterSign"
      handleClose={close}
      reduceWidth="max-w-[420px]"
    >
      <Box sx={{ px: 2, py: 1.5, color: "text.primary" }}>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          Enter the phone number registered in the BetterSign app. A login request
          is pushed to your phone; approve it there to sign in — no password.
        </Typography>
        <TextField
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
          disabled={busy}
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
        />
        {status && (
          <Typography
            variant="body2"
            sx={{ mb: 1.5, color: isError ? "error.main" : "text.primary" }}
          >
            {status}
          </Typography>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button type="button" onClick={close} variant="text" size="small">
            Close
          </Button>
          <Button
            type="button"
            onClick={send}
            disabled={busy}
            variant="contained"
            size="small"
          >
            {busy ? "Waiting…" : "Send request"}
          </Button>
        </Box>
      </Box>
    </ModalUi>
  );
}
