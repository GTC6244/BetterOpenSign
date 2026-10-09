import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ModalUi from "../../primitives/ModalUi";
import "../../styles/AddUser.css";
import RegexParser from "regex-parser";
import {
  signatureTypes,
  textInputWidget,
  cellsWidget,
  textWidget
} from "../../constant/Utils";
import {
  getRegexForType,
  widgetNamesArr
} from "../../utils";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

const WidgetNameModal = (props) => {
  const { t } = useTranslation();
  const signTypes = props?.signatureType || signatureTypes;
  const [lastSubmittedName, setLastSubmittedName] = useState("");
  const [formdata, setFormdata] = useState({
    name: "",
    defaultValue: "",
    status: "required",
    hint: "",
    textvalidate: "",
    isReadOnly: false,
    cellCount: 5,
  });
  const [rotation, setRotation] = useState(0);
  const [isValid, setIsValid] = useState(true);
  const statusArr = ["Required", "Optional"];
  const [signatureType, setSignatureType] = useState([]);
  const type = props?.defaultdata?.type;
  const isCellWidget = useMemo(() => type === cellsWidget, [type]);
  const isSignOrInitials = useMemo(
    () => ["signature", "initials"].includes(type),
    [type]
  );
  const showFontControls = useMemo(
    () =>
      [
        textInputWidget,
        textWidget,
        cellsWidget,
        "name",
        "company",
        "job title",
        "email"
      ].includes(props.defaultdata?.type),
    [type]
  );


  const handleHintPlaceholder = () => {
    const type = props.defaultdata?.type;

    if (type === "signature") {
      return t("draw-signature");
    } else if (type === "stamp" || type === "image") {
      return type === "stamp" ? t("upload-stamp-image") : t("upload-image");
    } else if (type === "initials") {
      return t("draw-initials");
    } else if (type === textInputWidget) {
      return t("enter-text");
    } else {
      return t("enter-widgettype", { widgetType: type });
    }
  };
  useEffect(() => {
    if (props.defaultdata) {
      setFormdata({
        name: props.defaultdata?.options?.name || "",
        defaultValue: props.defaultdata?.options?.defaultValue || "",
        status: props.defaultdata?.options?.status || "required",
        hint: props.defaultdata?.options?.hint || "",
        textvalidate:
          props.defaultdata?.options?.validation?.type === "regex"
            ? props.defaultdata?.options?.validation?.pattern
            : props.defaultdata?.options?.validation?.type || "",
        isReadOnly: props.defaultdata?.options?.isReadOnly || false,
        cellCount: props.defaultdata?.options?.cellCount || 5,
      });
      setLastSubmittedName(props.defaultdata?.options?.name || "");
      setRotation(props.defaultdata?.options?.rotation || 0);
    } else {
      setFormdata({
        ...formdata,
        name: props.defaultdata?.options?.name || "",
        cellCount: props.defaultdata?.options?.cellCount || 5,
      });
      setLastSubmittedName(props.defaultdata?.options?.name || "");
      setRotation(props.defaultdata?.options?.rotation || 0);
    }

    if (signTypes.length > 0) {
      const defaultSignatureType = signTypes || [];
      setSignatureType(defaultSignatureType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.defaultdata]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.handleData) {
      const widgetNames = widgetNamesArr(
        props.widgetsSource,
        props?.activeSignerId
      );
      if (lastSubmittedName && lastSubmittedName !== formdata.name) {
        const widgetNameExist = widgetNames?.find(
          (widget) => widget === formdata.name
        );
        if (widgetNameExist) {
          alert(t("duplicate-widget-name-error"));
          return;
        }
      }
      if (isSignOrInitials) {
        const enabledSignTypes = signatureType?.filter((x) => x.enabled);
        const isDefaultSignTypeOnly =
          enabledSignTypes?.length === 1 &&
          enabledSignTypes[0]?.name === "default";
        if (enabledSignTypes.length === 0) {
          alert(t("at-least-one-signature-type"));
        } else if (isDefaultSignTypeOnly) {
          alert(t("expect-default-one-signature-type"));
        } else {
          const data = { ...formdata, signatureType, rotation };
          props.handleData(data, props.defaultdata?.type);
        }
      } else {

        const isTextInput = [
          textInputWidget,
          cellsWidget,
        ].includes(props.defaultdata?.type);
        const { isReadOnly, defaultValue, status } = formdata;
        // If it’s a text‐input widget, enforce that read-only fields have
        // either a defaultValue or an "optional" status.
        if (isTextInput) {
          const readOnlyWithoutValue =
            isReadOnly && !defaultValue && status !== "optional";
          if (readOnlyWithoutValue) {
            alert(t("readonly-error", { widgetName: props.defaultdata?.type }));
            return;
          }
        }
        let payload = formdata;
        props.handleData(payload);
      }
      setFormdata({
        isReadOnly: false,
        name: "",
        defaultValue: "",
        status: "required",
        hint: "",
        textvalidate: "",
        cellCount: 5,
      });
      setRotation(0);
      setSignatureType(signTypes);
    }
  };
  const handleChange = (e) => {
    if (e) {
      setFormdata({ ...formdata, [e.target.name]: e.target.value });
    } else {
      setFormdata({ ...formdata, textvalidate: "" });
    }
  };

  const handleChangeValidateInput = (e) => {
    if (e) {
      if (e.target.value === "ssn") {
        setFormdata({
          ...formdata,
          [e.target.name]: e.target.value,
          hint: "xxx-xx-xxxx",
          cellCount: 11
        });
      } else {
        setFormdata({ ...formdata, [e.target.name]: e.target.value });
      }
    } else {
      setFormdata({ ...formdata, textvalidate: "" });
    }
  };

  const handledefaultChange = (e) => {
    if (formdata.textvalidate) {
      const regexObject = RegexParser(getRegexForType(formdata.textvalidate));
      const isValidate = regexObject?.test(e.target.value);
      setIsValid(isValidate);
    } else {
      setIsValid(true);
    }

    const val = isCellWidget
      ? e.target.value.slice(0, formdata.cellCount)
      : e.target.value;

    setFormdata({ ...formdata, [e.target.name]: val });
  };


  const handleCheckboxChange = (index) => {
    // Update the state with the modified array
    setSignatureType((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  return (
    <ModalUi
      isOpen={props.isOpen}
      handleClose={props.handleClose && props.handleClose}
      title={isSignOrInitials ? t("signature-setting") : t("widget-info")}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: "20px",
          color: "text.primary",
          pt: [textInputWidget, cellsWidget].includes(props.defaultdata?.type)
            ? 0
            : isSignOrInitials
              ? 1
              : "20px"
        }}
      >
        {!isSignOrInitials && (
          <Box sx={{ mb: "0.75rem" }}>
            <Typography
              component="label"
              htmlFor="name"
              sx={{ fontSize: "13px" }}
            >
              {t("name")}
              <Box component="span" sx={{ color: "error.main" }}>
                {" "}
                *
              </Box>
            </Typography>
            <TextField
              size="small"
              fullWidth
              name="name"
              value={formdata.name}
              onChange={(e) => handleChange(e)}
              slotProps={{
                htmlInput: {
                  required: true,
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity(""),
                  sx: { fontSize: "0.75rem" }
                }
              }}
            />
          </Box>
        )}
        {isCellWidget && (
          <Box sx={{ mb: "0.75rem" }}>
            <Typography
              component="label"
              htmlFor="cellCount"
              sx={{ fontSize: "13px" }}
            >
              {t("cell-count")}
            </Typography>
            <TextField
              size="small"
              fullWidth
              type="number"
              name="cellCount"
              value={formdata.cellCount}
              onChange={(e) => handleChange(e)}
              slotProps={{
                htmlInput: {
                  min: "1",
                  required: true,
                  sx: { fontSize: "0.75rem" }
                }
              }}
            />
          </Box>
        )}
        {[
          textInputWidget,
          cellsWidget,
        ].includes(props.defaultdata?.type) &&
          props?.roleName !== "prefill" && (
            <>
              <Box sx={{ mb: "0.75rem" }}>
                <Typography
                  component="label"
                  htmlFor="name"
                  sx={{ fontSize: "13px" }}
                >
                  {t("default-value")}
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  name="defaultValue"
                  value={formdata.defaultValue}
                  onChange={(e) => handledefaultChange(e)}
                  autoComplete="off"
                  onBlur={() => {
                    if (isValid === false) {
                      setFormdata({ ...formdata, defaultValue: "" });
                      setIsValid(true);
                    }
                  }}
                  slotProps={{
                    htmlInput: {
                      maxLength: isCellWidget ? formdata.cellCount : undefined,
                      sx: { fontSize: "0.75rem" }
                    }
                  }}
                />
                {isValid === false && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12,
                      mt: 0.5
                    }}
                  >
                    <WarningAmberIcon
                      sx={{ fontSize: "15px", mr: 0.5, color: "warning.main" }}
                    />
                    {t("invalid-default-value")}
                  </Box>
                )}
              </Box>
            </>
          )}
        {!props?.isSelfSign && !isSignOrInitials && (
          <Box sx={{ mb: showFontControls ? "0.5rem" : "0.75rem" }}>
            <Stack direction="row" spacing="10px" sx={{ mb: "0.5rem" }}>
              {statusArr.map((data, ind) => {
                return (
                  <FormControlLabel
                    key={ind}
                    sx={{ m: 0 }}
                    control={
                      <Radio
                        size="small"
                        name="status"
                        onChange={() =>
                          setFormdata({
                            ...formdata,
                            status: data.toLowerCase()
                          })
                        }
                        checked={
                          formdata.status.toLowerCase() === data.toLowerCase()
                        }
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {t(`widget-status.${data}`)}
                      </Typography>
                    }
                  />
                );
              })}
            </Stack>
            {[
              textInputWidget,
              cellsWidget,
            ].includes(props.defaultdata?.type) && (
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    id="isReadOnly"
                    name="isReadOnly"
                    size="small"
                    checked={formdata.isReadOnly}
                    onChange={() =>
                      setFormdata((prev) => ({
                        ...formdata,
                        isReadOnly: !prev.isReadOnly
                      }))
                    }
                    sx={{ p: 0.5 }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: "13px",
                      textTransform: "capitalize"
                    }}
                  >
                    {t("read-only")}
                  </Typography>
                }
              />
            )}
          </Box>
        )}
        {isSignOrInitials && (
          <Box sx={{ mb: "0.75rem" }}>
            <Typography
              component="label"
              htmlFor="signaturetype"
              sx={{ fontSize: "14px", mb: "0.7rem", display: "block" }}
            >
              {t("allowed-signature-types")}
            </Typography>
            <Box
              sx={{
                ml: "7px",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: "10px",
                mb: "0.7rem"
              }}
            >
              {signatureType.map((type, i) => {
                return (
                  <FormControlLabel
                    key={i}
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        name="signaturetype"
                        onChange={() => handleCheckboxChange(i)}
                        checked={type.enabled}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={
                      <Typography
                        title={`Enabling this allow signers to ${type.name} signature`}
                        sx={{
                          fontSize: "13px",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          cursor: "default",
                          "&:hover": {
                            textDecoration: "underline",
                            textUnderlineOffset: "2px"
                          }
                        }}
                      >
                        {type.name}
                      </Typography>
                    }
                  />
                );
              })}
            </Box>
          </Box>
        )}
        {isSignOrInitials && (
          <Box sx={{ mb: "0.75rem" }}>
            <Typography sx={{ fontSize: "14px", mb: "0.7rem", display: "block" }}>
              {t("rotation")}
            </Typography>
            <Box
              sx={{ ml: "7px", display: "flex", alignItems: "center", gap: "10px" }}
            >
              <TextField
                select
                size="small"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                sx={{ width: "120px" }}
                slotProps={{ htmlInput: { sx: { fontSize: "0.75rem" } } }}
              >
                <MenuItem value={0}>0°</MenuItem>
                <MenuItem value={90}>90°</MenuItem>
                <MenuItem value={180}>180°</MenuItem>
                <MenuItem value={270}>270°</MenuItem>
              </TextField>
            </Box>
          </Box>
        )}
        {!props?.isSelfSign && props?.roleName !== "prefill" && (
          <Box sx={{ mb: "0.75rem" }}>
            <Typography
              component="label"
              htmlFor="hint"
              sx={{ fontSize: "13px" }}
            >
              {t("hint")}
            </Typography>
            <TextField
              size="small"
              fullWidth
              name="hint"
              placeholder={handleHintPlaceholder()}
              value={formdata.hint}
              onChange={(e) => handleChange(e)}
              slotProps={{
                htmlInput: { maxLength: 40, sx: { fontSize: "0.75rem" } }
              }}
            />
          </Box>
        )}

        {showFontControls && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              gap: 1.5,
              mb: 1.5
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                {t("font-size")}:{" "}
              </Box>
              <TextField
                select
                size="small"
                value={
                  props.fontSize || props.defaultdata?.options?.fontSize || 12
                }
                onChange={(e) => props.setFontSize(parseInt(e.target.value))}
                sx={{ ml: "7px", width: "60%" }}
                slotProps={{ htmlInput: { sx: { fontSize: "0.75rem" } } }}
              >
                {fontsizeArr.map((size, ind) => {
                  return (
                    <MenuItem value={size} key={ind} sx={{ fontSize: "13px" }}>
                      {size}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box component="span">{t("color")}: </Box>
              <TextField
                select
                size="small"
                value={
                  props.fontColor ||
                  props.defaultdata?.options?.fontColor ||
                  "black"
                }
                onChange={(e) => props.setFontColor(e.target.value)}
                sx={{
                  ml: { xs: "33px", md: 2 },
                  width: { xs: "65%", md: "100%" }
                }}
                slotProps={{ htmlInput: { sx: { fontSize: "0.75rem" } } }}
              >
                {fontColorArr.map((color, ind) => {
                  return (
                    <MenuItem value={color} key={ind}>
                      {t(`color-type.${color}`)}
                    </MenuItem>
                  );
                })}
              </TextField>
              <Box
                component="span"
                sx={{ width: 20, height: "19px", ml: 0.5 }}
                style={{
                  background:
                    props.fontColor ||
                    props.defaultdata?.options?.fontColor ||
                    "black"
                }}
              ></Box>
            </Box>
          </Box>
        )}


        <Divider sx={{ mb: "16px" }} />
        <Button type="submit" variant="contained">
          {t("save")}
        </Button>
      </Box>
    </ModalUi>
  );
};

export default WidgetNameModal;
