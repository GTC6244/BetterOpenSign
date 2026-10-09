import "../styles/signature.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";

const DateWidgetModal = ({
  children,
  title,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <Dialog
      id="dateWidgetModal"
      open={!!isOpen}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            minWidth: { md: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            fontSize: "0.875rem"
          }
        }
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            textAlign: "left",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "text.primary",
            pt: "15px",
            px: "20px"
          }}
        >
          {title}
        </DialogTitle>
      )}

      <Box>{children}</Box>
    </Dialog>
  );
};

export default DateWidgetModal;
