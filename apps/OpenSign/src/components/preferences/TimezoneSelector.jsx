import { t } from "i18next";
import React, { useState } from "react";
import TimezoneSelect from "react-timezone-select";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

const TimezoneSelector = (props) => {
  const theme = useTheme();
  const [selectedTimezone, setSelectedTimezone] = useState(props?.timezone);
  // Intl.DateTimeFormat().resolvedOptions().timeZone // Default to the user's local timezone

  const onChangeTimezone = (timezone) => {
    setSelectedTimezone(timezone?.value);
    props.setTimezone && props.setTimezone(timezone?.value);
  };

  // MD3 theme-driven styles for the react-select based TimezoneSelect
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 36,
      fontSize: 11,
      backgroundColor: theme.palette.background.paper,
      borderColor: state.isFocused
        ? theme.palette.primary.main
        : theme.palette.outline?.main || theme.palette.divider,
      boxShadow: "none",
      "&:hover": { borderColor: theme.palette.text.primary }
    }),
    valueContainer: (base) => ({ ...base, gap: 2 }),
    menu: (base) => ({
      ...base,
      zIndex: 1300,
      backgroundColor:
        theme.palette.surface?.container || theme.palette.background.paper,
      color: theme.palette.text.primary
    }),
    menuList: (base) => ({ ...base, overflow: "hidden" }),
    option: (base, state) => ({
      ...base,
      fontSize: 11,
      borderRadius: 8,
      margin: 4,
      width: "auto",
      backgroundColor: state.isFocused
        ? theme.palette.action.hover
        : "transparent",
      color: theme.palette.text.primary
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: 11,
      color: theme.palette.text.primary
    }),
    input: (base) => ({ ...base, color: theme.palette.text.primary }),
    multiValue: (base) => ({
      ...base,
      fontSize: 11,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.primary.contrastText
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: theme.palette.text.secondary
    })
  };

  return (
    <Box sx={{ maxWidth: 400, pr: "20px" }}>
      <Typography
        component="h1"
        sx={{ fontSize: 14, mb: "0.7rem", fontWeight: 500 }}
      >
        {t("select-timezone")}
      </Typography>
      <TimezoneSelect
        value={selectedTimezone}
        onChange={(timezone) => onChangeTimezone(timezone)}
        styles={selectStyles}
      />
    </Box>
  );
};

export default TimezoneSelector;
