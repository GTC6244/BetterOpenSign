// PhoneSign — "Sign on phone" via BetterSign (Experiment #2).
//
// A self-contained modal that lets a signer apply a field by authorizing it on
// their phone instead of drawing/typing. It talks to the BetterSign signing
// coordinator Worker (REACT_APP_BS_SIGN_URL, see Experiments/bs-opensign/web):
//   POST /api/sign/push/start { phone, docId, fieldId, docHash, docTitle }
//   GET  /api/sign/poll?sessionId=...   (long-poll)
// On approval the phone returns the user's initials/signature image plus a
// cryptographic signature over the document hash; `onSigned(initialsPng, meta)`
// hands the image back so the caller drops it into the field (same write path as
// the draw/type signature pad).
//
// This uses the dependency-free *push* flow (no QR library needed in the app).
// The QR flow is demonstrated by the experiment's standalone page.

import { useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { getEnv } from "../../constant/Utils";

function signBaseUrl() {
  const env = typeof getEnv === "function" ? getEnv() : null;
  return (
    env?.REACT_APP_BS_SIGN_URL ||
    process.env.REACT_APP_BS_SIGN_URL ||
    ""
  ).replace(/\/$/, "");
}

// SHA-256 hex of the field's identifying material. This is what the phone signs,
// binding the signature to this document + field.
async function docHashHex(docId, fieldId, docTitle) {
  const material = `${docId || ""}|${fieldId || ""}|${docTitle || ""}`;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material)
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PhoneSign({
  isOpen,
  onClose,
  fieldKey,
  docId,
  docTitle,
  onSigned
}) {
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
          `${base}/api/sign/poll?sessionId=${encodeURIComponent(sessionId)}`,
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
        setBusy(false);
        setStatus("Signed ✓");
        onSigned && onSigned(body.initialsPng, body);
        return;
      }
      if (body.status === "denied") {
        setBusy(false);
        setIsError(true);
        setStatus("Signing was declined on the phone.");
        return;
      }
      if (body.status === "expired" || res.status === 404) {
        setBusy(false);
        setIsError(true);
        setStatus("This request expired. Please try again.");
        return;
      }
      // pending: the poll endpoint long-polls; loop immediately.
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
      const docHash = await docHashHex(docId, fieldKey, docTitle);
      const res = await fetch(`${base}/api/sign/push/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          docId: docId || "",
          fieldId: fieldKey || "",
          docHash,
          docTitle: docTitle || ""
        })
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
      title="Sign on phone (BetterSign)"
      handleClose={close}
      reduceWidth="max-w-[420px]"
    >
      <div className="px-4 py-3 text-base-content">
        <p className="text-sm mb-3">
          Enter the phone number registered in the BetterSign app. A signing
          request is pushed to your phone; approve it there and your initials are
          applied to this field.
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
          disabled={busy}
          className="op-input op-input-bordered op-input-sm w-full focus:outline-none mb-3"
        />
        {status && (
          <div
            className={`text-sm mb-3 ${isError ? "text-red-500" : "text-base-content"}`}
          >
            {status}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="op-btn op-btn-ghost op-btn-sm"
          >
            Close
          </button>
          <button
            type="button"
            onClick={send}
            disabled={busy}
            className="op-btn op-btn-primary op-btn-sm"
          >
            {busy ? "Waiting…" : "Send request"}
          </button>
        </div>
      </div>
    </ModalUi>
  );
}
