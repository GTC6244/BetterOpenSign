import { useCallback, useState } from "react";
import ModalUi from "./ModalUi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function useShare({ title, text, url }) {
  const [error, setError] = useState(null);
  const isSupported = typeof navigator !== "undefined" && !!navigator.share;

  const share = useCallback(async () => {
    if (!isSupported) {
      setError(new Error("Web Share API not supported"));
      return;
    }
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      // User may have cancelled, or another error occurred
      setError(err);
    }
  }, [isSupported, title, text, url]);

  return { share, isSupported, error };
}

/**
 * A customizable ShareButton component.
 * If `children` are provided, they are used as the trigger element;
 * otherwise, a default share button is rendered.
 *
 * @param {object} props
 * @param {string} props.title - Title for sharing
 * @param {string} props.text - Text for sharing
 * @param {string} props.url   - URL to share
 * @param {string} [props.className] - Optional styling class
 * @param {React.ReactNode} [props.children] - Custom trigger element
 */
export default function ShareButton({ title, text, url, className, children }) {
  const { share, isSupported, error } = useShare({ title, text, url });
  const [isPopupOpen, setPopupOpen] = useState(false);

  // Shared style for the fallback share-option buttons
  const optionBtnSx = { m: 1, width: 190 };

  // Native Web Share API supported
  if (isSupported) {
    return (
      <button
        onClick={share}
        className={className}
        aria-label="Share this page"
      >
        {children || "🔗 Share"}
      </button>
    );
  }

  // Fallback: trigger opens popup
  const subject = encodeURIComponent(title || text);
  const body = encodeURIComponent(`${text}\n\n${url}`);

  return (
    <>
      {/* React Fragment */}
      <button
        onClick={() => setPopupOpen(true)}
        className={className}
        aria-label="Open share options"
      >
        {children || "🔗 Share"}
      </button>
      {isPopupOpen && (
        <ModalUi
          isOpen
          title={
            <>
              <i className="fa-solid fa-share-from-square"></i> Share
            </>
          }
          handleClose={() => setPopupOpen(false)}
        >
          {error && (
            <Typography sx={{ color: "error.main" }}>
              Error: {error.message}
            </Typography>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              justifyItems: "start",
              p: "20px"
            }}
          >
            {/* Copy Link */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-solid fa-clipboard fa-lg"></i>}
              onClick={() => navigator.clipboard.writeText(url)}
            >
              Copy to clipboard
            </Button>
            {/* Twitter */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-brands fa-square-x-twitter fa-lg"></i>}
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              Share on Twitter
            </Button>

            {/* Facebook */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-brands fa-square-facebook fa-lg"></i>}
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              Share on Facebook
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-brands fa-square-whatsapp fa-lg"></i>}
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              Share on WhatsApp
            </Button>

            {/* Gmail (Web) */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-solid fa-envelope fa-lg"></i>}
              onClick={() =>
                window.open(
                  `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              Share via Gmail
            </Button>

            {/* Microsoft Teams */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-brands fa-microsoft fa-lg"></i>}
              onClick={() =>
                window.open(
                  `https://teams.microsoft.com/l/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              Share on Teams
            </Button>

            {/* Outlook Web */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={optionBtnSx}
              startIcon={<i className="fa-solid fa-envelope-open-text fa-lg"></i>}
              onClick={() =>
                window.open(
                  `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${subject}&body=${body}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              Share via Outlook
            </Button>
          </Box>
        </ModalUi>
      )}
    </>
  );
}
