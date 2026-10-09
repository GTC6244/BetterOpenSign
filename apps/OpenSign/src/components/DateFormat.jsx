import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const DateFormat = ({ selectDate, dateFormatList, handleChangeFormat }) => {
  const selectedFormatIndex = dateFormatList?.findIndex(
    (item) => item.format === selectDate?.format
  );
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        rowGap: 1.5,
        my: 1
      }}
    >
      <Typography
        component="span"
        sx={{ textTransform: "capitalize", fontSize: "0.875rem" }}
      >
        {t("format")}:{" "}
      </Typography>
      <TextField
        select
        size="small"
        value={selectedFormatIndex >= 0 ? selectedFormatIndex : ""}
        onChange={(e) => handleChangeFormat(e)}
        sx={{ ml: { md: 1 }, minWidth: 180, "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
      >
        <MenuItem value="" disabled>
          {t("select-date-format")}
        </MenuItem>
        {dateFormatList.map((data, ind) => {
          return (
            <MenuItem sx={{ fontSize: "13px" }} value={ind} key={ind}>
              {data?.date ? data?.date : "nodata"}
            </MenuItem>
          );
        })}
      </TextField>
      <Typography
        component="span"
        sx={{
          fontSize: "0.75rem",
          color: "text.secondary",
          ml: 1,
          textTransform: "uppercase"
        }}
      >
        {selectDate.format}
      </Typography>
    </Box>
  );
};

export default DateFormat;
