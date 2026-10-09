import { useEffect, useState } from "react";
import { dateFormat, formatDate, withSessionValidation } from "../../../utils";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  setAlertInfo,
  setLoader,
  setUserInfo
} from "../../../redux/reducers/userReducer";
import DatePicker from "../../DatePicker";
import DateFormat from "../../DateFormat";
import {
  changeDateToMomentFormat,
  selectFormat
} from "../../../constant/Utils";
import moment from "moment";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Tooltip from "../../../primitives/Tooltip";


const WidgetsTab = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const [selectDate, setSelectDate] = useState({
    date: "",
    format: "MM/dd/yyyy"
  });
  const [dateFormatList, setDateFormatList] = useState([]);
  const [dateWidget, setDateWidget] = useState({
    isSigningDate: false,
    isReadOnly: false,
    date: "",
    format: "MM/dd/yyyy"
  });

  useEffect(() => {
    updateStates();
  }, [userInfo]);

  const updateStates = () => {
    const widgetPreferences = userInfo?.WidgetPreferences || [];
    const dateWidgetPref = widgetPreferences.find((w) => w.type === "date") || {
      isSigningDate: false,
      isReadOnly: false
    };
    setDateWidget({
      isSigningDate: !!dateWidgetPref.isSigningDate,
      isReadOnly: !!dateWidgetPref.isReadOnly,
      date: dateWidgetPref.date,
      format: dateWidgetPref.format
    });
    setSelectDate({ date: dateWidgetPref.date, format: dateWidgetPref.format });
    const formatted = moment(
      dateWidgetPref.date,
      changeDateToMomentFormat(dateWidgetPref.format),
      true
    ).toISOString();
    formatDateList(formatted);
  };

  const handleSigningDateChange = (e) => {
    if (e.target.checked) {
      setSelectDate({ date: "", format: selectDate.format });
    }
    setDateWidget((prev) => ({
      ...prev,
      date: "",
      isSigningDate: e.target.checked
    }));
  };

  const handleReadOnlyChange = (e) => {
    setDateWidget({ ...dateWidget, isReadOnly: e.target.checked });
  };

  const showAlert = (type, msg) => {
    dispatch(setAlertInfo({ type, msg }));
    setTimeout(() => {
      dispatch(setAlertInfo({ type: "success", msg: "" }));
    }, 2000);
  };
  // `handleSave` is used save updated value signature type
  const handleSave = withSessionValidation(async () => {
    dispatch(setLoader(true));
    try {
      if (
        dateWidget?.isReadOnly &&
        !selectDate.date &&
        !dateWidget.isSigningDate
      ) {
        alert(t("read-only-date-error"));
        return;
      }
      const res = await Parse.Cloud.run("setwidgetpreferences", {
        dateWidget: dateWidget
      });
      if (res) {
        const widgetPreferences = userInfo?.WidgetPreferences || [];
        // Normalize booleans (simple + safe)
        const dateOpt = { type: "date", ...dateWidget };
        // Upsert: replace if exists, otherwise append
        const updatedWidgetPreferences =
          widgetPreferences?.length > 0
            ? widgetPreferences.map((w) => (w.type === "date" ? dateOpt : w))
            : [...widgetPreferences, dateOpt];
        const userdata = { ...userInfo };
        userdata.WidgetPreferences = updatedWidgetPreferences;
        dispatch(setUserInfo(userdata));
        showAlert("success", t("saved-successfully"));
      }
    } catch (error) {
      console.error("Widgets preferences error: ", error);
      showAlert("danger", error.message);
    } finally {
      dispatch(setLoader(false));
    }
  });
  const handleDateChange = (date) => {
    //function to save date and format in local array
    const formattedDate = formatDate({
      date: date,
      format: selectDate.format
    });
    setDateWidget({
      ...dateWidget,
      isSigningDate: false,
      date: formattedDate,
      format: selectDate.format
    });
    setSelectDate({ date: formattedDate, format: selectDate.format });
    formatDateList(date);
  };

  const formatDateList = (selecteddate) => {
    let date = selecteddate || new Date();
    const list = dateFormat.map((dateFormat) => {
      const format = selectFormat(dateFormat);
      return { date: formatDate({ date, format }), format: format };
    });
    setDateFormatList(list);
  };
  const handleChangeFormat = (e) => {
    e.stopPropagation();
    const selectedIndex = Number(e.target.value);
    const format = dateFormatList[selectedIndex]?.format;
    const dateObj =
      selectDate.date && !dateWidget?.isSigningDate
        ? { date: dateFormatList[selectedIndex]?.date, format: format }
        : { format: format };
    setDateWidget((prev) => ({ ...prev, ...dateObj }));
    setSelectDate((prev) => ({ ...prev, ...dateObj }));
  };
  const handleClear = () => {
    setSelectDate((prev) => ({ ...prev, date: "" }));
    setDateWidget((prev) => ({ ...prev, date: "" }));
  };
  return (
    <Box id="panel-widgets">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
          columnGap: { md: 4 },
          rowGap: 3
        }}
      >
        {/* Left Column - Signature Settings */}
        <Box
          sx={{
            gridColumn: { md: "span 6" },
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box>
            <Typography
              component="label"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: 14,
                mb: 0,
                fontWeight: 500
              }}
            >
              {t("date-widget")}
              <Tooltip
                id="date-widget-tooltip"
                maxWidth
                message={
                  <Box sx={{ maxWidth: 450 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {t("date-widget")}
                    </Typography>
                    <Typography>{t("date-pref-help-sub-title")}</Typography>
                    <Box
                      component="ol"
                      sx={{ listStyle: "disc", pl: 2, p: "5px" }}
                    >
                      <li>
                        <Box
                          component="span"
                          sx={{ fontWeight: 700, textTransform: "capitalize" }}
                        >
                          {t("format")}:{" "}
                        </Box>
                        <span>{t("date-pref-help-format")}</span>
                      </li>
                      <li>
                        <Box
                          component="span"
                          sx={{ fontWeight: 700, textTransform: "capitalize" }}
                        >
                          {t("default-date")}:{" "}
                        </Box>
                        <span>{t("date-pref-help-default-date")}</span>
                      </li>
                      <li>
                        <Box
                          component="span"
                          sx={{ fontWeight: 700, textTransform: "capitalize" }}
                        >
                          {t("signing-date")}:{" "}
                        </Box>
                        <span>{t("date-pref-help-signing-date")}</span>
                      </li>
                      <li>
                        <Box
                          component="span"
                          sx={{ fontWeight: 700, textTransform: "capitalize" }}
                        >
                          {t("read-only")}:{" "}
                        </Box>
                        <span>{t("date-pref-help-read-only")}</span>
                      </li>
                    </Box>
                  </Box>
                }
              />
            </Typography>
            <DateFormat
              selectDate={selectDate}
              dateFormatList={dateFormatList}
              handleChangeFormat={handleChangeFormat}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { md: "center" },
                gap: 0.5,
                width: { md: 300 }
              }}
            >
              <DatePicker
                selectDate={selectDate}
                onChange={handleDateChange}
                handleClear={handleClear}
              />
            </Box>
            <Box
              sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <FormControlLabel
                sx={{ ml: 0, gap: 1 }}
                control={
                  <Checkbox
                    size="small"
                    id="date-widget-signingdate"
                    name="isSigningDate"
                    onChange={handleSigningDateChange}
                    checked={dateWidget.isSigningDate}
                    sx={{ p: 0 }}
                  />
                }
                label={
                  <Typography
                    title={t("signing-date")}
                    sx={{
                      fontSize: 14,
                      fontWeight: 500,
                      textTransform: "capitalize"
                    }}
                  >
                    {t("signing-date")}
                  </Typography>
                }
              />
              <FormControlLabel
                sx={{ ml: 0, gap: 1 }}
                control={
                  <Checkbox
                    size="small"
                    id="date-widget-readonly"
                    name="isReadOnly"
                    onChange={handleReadOnlyChange}
                    checked={dateWidget.isReadOnly}
                    sx={{ p: 0 }}
                  />
                }
                label={
                  <Typography
                    title={t("read-only")}
                    sx={{
                      fontSize: 14,
                      fontWeight: 500,
                      textTransform: "capitalize"
                    }}
                  >
                    {t("read-only")}
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>

        {/* Save Button - Full Width */}
        <Box
          sx={{
            gridColumn: { md: "span 12" },
            display: "flex",
            justifyContent: "flex-start",
            mt: 1.5
          }}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ width: 110 }}
          >
            {t("save")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WidgetsTab;
