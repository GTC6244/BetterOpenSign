import React, { useState } from "react";
import { formatDateTime } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";

const DateFormatSelector = (props) => {
  const { t } = useTranslation();
  const date = new Date();
  const [selectedFormat, setSelectedFormat] = useState(props.dateFormat);
  const [is12Hour, setIs12Hour] = useState(props?.is12HourTime);

  const dateFormats = [
    "MM/DD/YYYY",
    "MM-DD-YYYY",
    "MM.DD.YYYY",
    "DD/MM/YYYY",
    "DD-MM-YYYY",
    "DD.MM.YYYY",
    "YYYY-MM-DD",
    "MMM DD, YYYY",
    "MMMM DD, YYYY",
    "DD MMM, YYYY",
    "DD MMMM, YYYY",
    "DD-MMM-YYYY"
  ];

  // Handle format change
  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
    props.setDateFormat && props.setDateFormat(event.target.value);
  };
  const handleHrInput = () => {
    setIs12Hour(!is12Hour);
    props.setIs12HourTime && props.setIs12HourTime(!is12Hour);
  };
  return (
    <Box sx={{ maxWidth: 400, pr: "20px" }}>
      <Typography
        component="label"
        sx={{ display: "block", fontSize: 14, mb: "0.7rem", fontWeight: 500 }}
      >
        {t("date-format")}
      </Typography>
      <TextField
        select
        size="small"
        fullWidth
        value={selectedFormat}
        onChange={handleFormatChange}
        sx={{ "& .MuiInputBase-input": { fontSize: 11 } }}
      >
        {dateFormats.map((format) => (
          <MenuItem key={format} value={format} sx={{ fontSize: 11 }}>
            {format}
          </MenuItem>
        ))}
      </TextField>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: "0.75rem" }}>
        <FormControlLabel
          sx={{ ml: "2px", mr: 0 }}
          control={
            <Radio
              size="small"
              value={true}
              checked={is12Hour}
              onChange={handleHrInput}
            />
          }
          label="12 hr"
          slotProps={{ typography: { sx: { fontSize: 12 } } }}
        />
        <FormControlLabel
          sx={{ ml: "2px", mr: 0 }}
          control={
            <Radio
              size="small"
              value={false}
              checked={!is12Hour}
              onChange={handleHrInput}
            />
          }
          label="24 hr"
          slotProps={{ typography: { sx: { fontSize: 12 } } }}
        />
      </Box>
      <Typography sx={{ mt: "12px", ml: "10px", fontSize: 13, fontWeight: 500 }}>
        <strong>
          {formatDateTime(date, selectedFormat, props?.timezone, is12Hour)}
        </strong>
      </Typography>
    </Box>
  );
};

export default DateFormatSelector;
