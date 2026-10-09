import React, { useEffect, useState, useRef } from "react";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function PageReorderModal({
  isOpen,
  handleClose,
  totalPages = 0,
  onSave
}) {
  const { t } = useTranslation();
  const [order, setOrder] = useState([]);
  // Keeps track of the page order relative to the original PDF
  const orderRef = useRef([]);
  // Captures the order when the modal opens
  const initialOrderRef = useRef([]);

  // Initialize orderRef when total pages change (e.g. after upload)
  useEffect(() => {
    if (orderRef.current.length !== totalPages) {
      orderRef.current = Array.from({ length: totalPages }, (_, i) => i + 1);
    }
  }, [totalPages]);

  // When modal opens, display the last saved order and store it as initial
  useEffect(() => {
    if (isOpen) {
      setOrder(orderRef.current);
      initialOrderRef.current = [...orderRef.current];
    }
  }, [isOpen]);

  const move = (index, dir) => {
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= order.length) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setOrder(newOrder);
  };

  const handleSave = () => {
    const saveOrder = order.map((num) =>
      initialOrderRef.current.indexOf(num) + 1
    );
    // Persist the new display order for next time
    orderRef.current = [...order];
    onSave && onSave(saveOrder);
  };

  const isUnchanged =
    order.length === initialOrderRef.current.length &&
    order.every((n, i) => n === initialOrderRef.current[i]);

  return (
    <ModalUi isOpen={isOpen} handleClose={handleClose} title={t("reorder-pages")}>
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={1}>
          {order.map((num, i) => (
            <Box
              key={num}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography component="span">
                {t("page")} {num}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  size="small"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={i === order.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Divider sx={{ my: 1.5 }} />
          <Button
            onClick={handleSave}
            type="button"
            variant="contained"
            disabled={isUnchanged}
          >
            {t("save")}
          </Button>
          <Button onClick={handleClose} type="button" variant="text">
            {t("close")}
          </Button>
        </Stack>
      </Box>
    </ModalUi>
  );
}
