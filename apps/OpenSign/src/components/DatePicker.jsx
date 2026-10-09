import { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import {
  getDefaultDate,
  getMonth,
  getYear,
  months,
  years
} from "../constant/Utils";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

const DatePicker = ({
  selectDate,
  format,
  minDate,
  maxDate,
  onChange,
  handleClear,
  label,
  showLabel = true,
  showClear = true,
  dateClassName = ""
}) => {
  const { t } = useTranslation();

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <Box
      onClick={onClick}
      ref={ref}
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "outline.main",
        borderRadius: "50px",
        px: 1.5,
        py: 1,
        fontSize: "0.75rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "&:hover": { borderColor: "text.primary" }
      }}
    >
      <Box
        component="span"
        className={dateClassName}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {value}
      </Box>
      <i className={`fa-light fa-calendar`}></i>
    </Box>
  ));
  CustomInput.displayName = "CustomInput";

  return (
    <>
      {showLabel && (
        <Box component="span" sx={{ flexShrink: 0 }}>
          {label || t("default-date")}:{" "}
        </Box>
      )}
      <ReactDatePicker
        renderCustomHeader={({ date, changeYear, changeMonth }) => (
          <Box sx={{ display: "flex", justifyContent: "flex-start", ml: { md: 1 } }}>
            <Box
              component="select"
              sx={{ bgcolor: "transparent", outline: "none", color: "text.primary" }}
              value={months[getMonth(date)]}
              onChange={({ target: { value } }) =>
                changeMonth(months.indexOf(value))
              }
            >
              {months.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Box>
            <Box
              component="select"
              sx={{ bgcolor: "transparent", outline: "none", color: "text.primary" }}
              value={getYear(date)}
              onChange={({ target: { value } }) => changeYear(value)}
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Box>
          </Box>
        )}
        wrapperClassName="w-full"
        closeOnScroll={true}
        selected={getDefaultDate(selectDate?.date, selectDate?.format)}
        popperPlacement="top-end"
        customInput={<CustomInput />}
        onChange={(date) => onChange(date)}
        dateFormat={
          selectDate ? selectDate?.format : format ? format : "MM/dd/yyyy"
        }
        portalId="root-portal"
      />
      {showClear && handleClear && (
        <Link
          component="button"
          type="button"
          onClick={() => handleClear()}
          color="info"
          underline="always"
          sx={{ cursor: "pointer", ml: 1 }}
        >
          {t("clear")}
        </Link>
      )}
    </>
  );
};

export default DatePicker;
