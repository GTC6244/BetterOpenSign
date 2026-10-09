import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Loader from "./Loader";
import Tooltip from "./Tooltip";

/**
 * MD3 dialog (replaces the DaisyUI `op-modal`).
 *
 * The public API is unchanged so existing callers keep working:
 *   id, children, title, isOpen, handleClose, showHeader, showClose,
 *   reduceWidth, position, crossColor, showScrollBar, isLoader, helpText
 *
 * `reduceWidth` historically carried Tailwind width classes; it is forwarded to
 * the dialog surface as a className so those widths still apply during migration.
 * `position="bottom"` renders as an MD3 bottom sheet.
 */
const ModalUi = ({
  id,
  children,
  title,
  isOpen,
  handleClose,
  showHeader = true,
  showClose = true,
  reduceWidth,
  position,
  crossColor,
  showScrollBar = false,
  isLoader = false,
  helpText = ""
}) => {
  const { t } = useTranslation();
  const isBottom = position === "bottom";

  return (
    <Dialog
      id={id || "selectSignerModal"}
      open={!!isOpen}
      onClose={() => handleClose && handleClose()}
      scroll="paper"
      fullWidth
      maxWidth={false}
      sx={{
        zIndex: 1300,
        ...(isBottom && {
          "& .MuiDialog-container": { alignItems: "flex-end" }
        })
      }}
      slotProps={{
        paper: {
          className: reduceWidth || undefined,
          sx: {
            position: "relative",
            overflow: "visible",
            fontSize: "0.875rem",
            width: reduceWidth ? undefined : { xs: "92vw", md: 500 },
            maxWidth: "96vw",
            m: isBottom ? 0 : 2,
            ...(isBottom && {
              width: "100%",
              maxWidth: "100%",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            })
          }
        }
      }}
    >
      {isLoader && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            borderRadius: "inherit"
          }}
        >
          <Loader />
        </Box>
      )}

      {showHeader && (title || showClose) && (
        <>
          {title && (
            <DialogTitle
              sx={{
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "text.primary",
                pr: 6
              }}
            >
              {title}
              {helpText && (
                <Box component="span" sx={{ ml: 0.5, fontSize: "0.875rem" }}>
                  <Tooltip id={title} message={t(helpText)} />
                </Box>
              )}
            </DialogTitle>
          )}
          {showClose && (
            <IconButton
              aria-label="close"
              onClick={() => handleClose && handleClose()}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                zIndex: 40,
                color: crossColor || "text.primary"
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </>
      )}

      <Box
        sx={{
          overflowY: "auto",
          ...(showScrollBar
            ? {}
            : {
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" }
              })
        }}
      >
        {children}
      </Box>
    </Dialog>
  );
};

export default ModalUi;
