import { useState, useEffect } from "react";
import ModalUi from "../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const ColumnSelector = ({
  isOpen,
  allColumns = [],
  visibleColumns = [],
  columnLabels = {},
  onApply,
  onClose
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(visibleColumns);
  const [names, setNames] = useState(columnLabels);

  useEffect(() => {
    setSelected(visibleColumns);
    setNames(columnLabels);
  }, [visibleColumns, columnLabels]);

  const handleChange = (col) => {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleApply = () => {
    onApply && onApply(selected, names);
    onClose && onClose();
  };

  return (
    <ModalUi isOpen={isOpen} title={t("select-columns")} handleClose={onClose}>
      <Box sx={{ p: "20px", display: "flex", flexDirection: "column", gap: 1 }}>
        {allColumns.map((col, i) => (
          <FormControlLabel
            key={col}
            control={
              <Checkbox
                id={col + "_" + i}
                size="small"
                checked={selected.includes(col)}
                onChange={() => handleChange(col)}
              />
            }
            label={t(`report-heading.${col}`, { defaultValue: col })}
            sx={{ "& .MuiFormControlLabel-label": { whiteSpace: "nowrap" } }}
          />
        ))}
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
          <Button onClick={handleApply} variant="contained">
            {t("apply")}
          </Button>
        </Box>
      </Box>
    </ModalUi>
  );
};

export default ColumnSelector;
