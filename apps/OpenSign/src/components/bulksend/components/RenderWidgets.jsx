import { forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import SignatureCanvas from "react-signature-canvas";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  changeDateToMomentFormat,
  compressedFileSize,
  generateId,
  getMonth,
  getYear,
  months,
  radioButtonWidget,
  textInputWidget,
  textWidget,
  years
} from "../../../constant/Utils";
import PenColorComponent from "../../pdf/tab/PenColorComponent";
import { getDatePickerDate, toHtmlPattern } from "../../../utils";
import { emailRegex } from "../../../constant/const";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Link from "@mui/material/Link";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const inputOpt = new Set(["text", "email", "number"]);
const PREFILL_PREFIX = "prefill::";

const inputTypes = {
  email: emailRegex,
  number: /^[0-9\s]*$/,
  ssn: /^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/
};
const inputValidation = (pattern, type) => {
  if (pattern) return pattern;
  return inputTypes[type] || "";
};
// Canvas elements can't be themed via MUI `sx`, so the signature/draw canvas
// keeps the OpenSign theme-aware utility classes for its border/background.
const canavasTheme = `opensigncss:bg-white opensigndark:bg-[#121212] opensigndark:border-[#f6f3f4]/20 opensigncss:border-gray-300 opensigndark:hover:border-white opensigncss:hover:border-black border-[1px]`;

const WidgetLabel = ({ name, isRequired = false }) => (
  <Typography
    component="div"
    sx={{ display: "block", fontSize: "0.75rem", fontWeight: 600, mb: 1 }}
  >
    {name}
    {isRequired && (
      <Box component="span" sx={{ color: "error.main" }}>
        {" *"}
      </Box>
    )}
  </Typography>
);

const DateWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const format = widget?.options?.validation?.format || "MM/dd/yyyy";

  const PrefillDateInput = forwardRef(({ value, onClick }, ref) => (
    <Box
      ref={ref}
      onClick={onClick}
      sx={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        border: 1,
        borderColor: "outline.main",
        borderRadius: "12px",
        px: 1.25,
        py: 0.75,
        fontSize: "0.875rem",
        cursor: "pointer",
        bgcolor: "background.paper",
        color: "text.primary",
        "&:hover": { borderColor: "text.primary" }
      }}
    >
      <span>{value ? value : format}</span>
      <CalendarTodayIcon sx={{ fontSize: 14, ml: 0.5 }} />
    </Box>
  ));
  PrefillDateInput.displayName = "PrefillDateInput";

  const handleDate = (widget) => {
    // The getDatePickerDate function retrieves the date in the correct format supported by the DatePicker.
    try {
      return getDatePickerDate(widget?.response, format);
    } catch (err) {
      console.error("handleDate error ", err);
      return;
    }
  };

  //function to set date with required date format onchange date
  const handleOnDateChange = (date) => {
    let updateDate = date;
    let newDate;
    const isSpecialDateFormat =
      format && ["dd-MM-yyyy", "dd.MM.yyyy", "dd/MM/yyyy"].includes(format);
    if (isSpecialDateFormat) {
      newDate = moment(updateDate).format(changeDateToMomentFormat(format));
    } else {
      //using moment package is used to change date as per the format provided in selectDate obj e.g. - MM/dd/yyyy -> 03/12/2024
      newDate = new Date(updateDate);
      newDate = moment(newDate.getTime()).format(
        changeDateToMomentFormat(format)
      );
    }
    onChange(newDate);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box sx={{ minWidth: "max-content" }}>
        <DatePicker
          portalId="datepicker-portal-root"
          id={`widget-${widget?.options?.name}-${widget.key}`}
          renderCustomHeader={({ date, changeYear, changeMonth }) => (
            <div className="flex justify-start ml-2">
              <select
                className="bg-transparent outline-none"
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
              </select>
              <select
                className="bg-transparent outline-none"
                value={getYear(date)}
                onChange={({ target: { value } }) => changeYear(value)}
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          wrapperClassName="w-full"
          closeOnScroll={true}
          selected={handleDate(widget)}
          onChange={(date) => handleOnDateChange(date, widget)}
          customInput={<PrefillDateInput />}
          dateFormat={widget?.options?.validation?.format || "MM/dd/yyyy"}
          required={isRequired}
        />
      </Box>
    </Box>
  );
};
const TextWidget = ({
  widget,
  isRequired,
  onChange,
  showLabel,
}) => {
  const { t } = useTranslation();
  const inputType = widget?.options?.validation?.type || "";
  const serverRegex = widget?.options?.validation?.pattern;
  const isPredfineType = inputType ? inputOpt?.has(inputType) : "";
  const regExpression = inputValidation(serverRegex, inputType);
  const pattern = useMemo(() => toHtmlPattern(regExpression), [regExpression]);
  const [value, setValue] = useState(() => {
    const response =
      widget?.options?.response ?? widget?.options?.defaultValue ?? "";
    return inputType === "number" && response ? Number(response) : response;
  });

  const handleInputChange = (e) => {
    const text = e.target.value || "";
    setValue(text);
    onChange(text);
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box sx={{ minWidth: "max-content" }}>
        <TextField
          type={isPredfineType ? inputType : "text"}
          id={`widget-${widget?.options?.name}-${widget.key}`}
          value={value}
          placeholder={
            widget?.options?.hint ||
            t("enter-value", { value: widget?.options?.name })
          }
          size="small"
          fullWidth
          onChange={(e) => handleInputChange(e)}
          required={isRequired}
          slotProps={{
            htmlInput: {
              pattern: pattern || undefined, // if no pattern, browser won't do pattern validation
              onInvalid: (e) => {
                const el = e.currentTarget;
                // ✅ Only override message if pattern exists AND the error is patternMismatch
                if (pattern && el.validity.patternMismatch) {
                  el.setCustomValidity(t("validation-alert-1"));
                } else {
                  el.setCustomValidity("");
                }
              },
              onInput: (e) => {
                e.currentTarget.setCustomValidity("");
              }
            }
          }}
          sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
        />
      </Box>
    </Box>
  );
};
const CheckboxWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const [selectedCheckbox, setSelectedCheckbox] = useState(
    () => widget?.options?.response || widget?.options?.defaultValue || []
  );
  const groupName = `checkbox-group-${widget.key}`;
  const noneSelected = (selectedCheckbox?.length ?? 0) === 0;

  const handleCheckboxValue = (isChecked, ind) => {
    // ✅ clear hidden input error immediately
    const hidden = document.querySelector(`input[name="${groupName}"]`);
    hidden?.setCustomValidity("");

    const prevArr = Array.isArray(selectedCheckbox) ? selectedCheckbox : [];

    const updateResponse = isChecked
      ? prevArr.includes(ind)
        ? prevArr
        : [...prevArr, ind] // add once
      : prevArr.filter((v) => v !== ind); // remove

    setSelectedCheckbox(updateResponse);
    onChange(updateResponse);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          minWidth: "max-content",
          position: "relative"
        }}
      >
        {widget.options?.values?.map((value, ind) => (
          <FormControlLabel
            key={ind}
            className="select-none-cls"
            sx={{ m: 0, userSelect: "none" }}
            control={
              <Checkbox
                id={`checkbox-${widget.key + ind}`}
                size="small"
                checked={selectedCheckbox.includes(ind)}
                onChange={(e) => handleCheckboxValue(e.target.checked, ind)}
                sx={{ p: 0.25 }}
              />
            }
            label={
              <Box
                component="span"
                sx={{ fontSize: "0.75rem", cursor: "pointer", ml: 0.5 }}
              >
                {value}
              </Box>
            }
          />
        ))}
        {/* ✅ the validator */}
        {isRequired && (
          <Box
            component="input"
            tabIndex={-1}
            aria-hidden="true"
            name={groupName}
            value={noneSelected ? "" : "selected"} // empty => invalid, non-empty => valid
            required
            onInvalid={(e) =>
              e.target.setCustomValidity(t("select-at-least-option"))
            }
            onChange={(e) => e.target.setCustomValidity("")}
            sx={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              width: "2px",
              height: "2px",
              left: "0.46rem",
              top: 16
            }}
          />
        )}
      </Box>
    </Box>
  );
};
const DropdownWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(
    () =>
      widget?.options?.response?.trim() ||
      widget?.options?.defaultValue?.trim() ||
      ""
  );

  const handleDropdownChange = (value) => {
    const select = value?.trim();
    setSelected(select);
    onChange(select);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box sx={{ minWidth: "max-content" }}>
        <TextField
          select
          SelectProps={{ native: true }}
          id={`widget-${widget?.options?.name}-${widget?.key}`}
          value={selected}
          onChange={(e) => handleDropdownChange(e.target.value)}
          required={isRequired}
          size="small"
          fullWidth
          sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
        >
          {/* Default/Title option */}
          <option value="" disabled hidden>
            {t("choose-one")}
          </option>
          {widget?.options?.values?.map((option, ind) => (
            <option key={ind} value={option?.trim()}>
              {option}
            </option>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};
const RadioButtonWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const [selected, setSelected] = useState(
    () =>
      widget?.options?.response?.trim() ||
      widget?.options?.defaultValue?.trim() ||
      ""
  );
  const id = generateId(4);

  const handleRadioChange = (value) => {
    const select = value?.trim();
    setSelected(select);
    onChange(select);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          minWidth: "max-content"
        }}
      >
        {widget.options?.values?.map((data, ind) => (
          <FormControlLabel
            key={ind}
            className="select-none-cls"
            sx={{ m: 0, userSelect: "none" }}
            control={
              <Radio
                id={`radio-${widget.key + ind}`}
                name={`radio-group-${widget.key}-${id}`} // ✅ same name => browser treats all radios as ONE group
                size="small"
                required={isRequired && ind === 0} // ✅ set required ONCE (on first radio) to make the whole group mandatory
                checked={selected === data?.trim()}
                onChange={() => handleRadioChange(data)}
                sx={{ p: 0.25 }}
              />
            }
            label={
              <Box
                component="span"
                sx={{ fontSize: "0.75rem", cursor: "pointer", ml: 0.25 }}
              >
                {data}
              </Box>
            }
          />
        ))}
      </Box>
    </Box>
  );
};
const ImageWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const imageRef = useRef(null);
  const [img, setImg] = useState({ src: "", imgType: "" });
  const [defaultImg, setDefaultImg] = useState({ src: "", imgType: "" });

  useEffect(() => {
    if (widget?.response) {
      setDefaultImg({ src: widget?.response, imgType: "" });
    }
  }, []);

  const onImageChange = (e) => {
    if (e.target.files && e.target.files?.[0]) {
      const file = e.target.files?.[0];
      compressedFileSize(file, ({ src, imgType }) => {
        onChange(src);
        setImg({ src, imgType });
      });
    }
  };
  const handleClearImage = () => {
    setDefaultImg({ src: "", imgType: "" });
    setImg({ src: "", imgType: "" });
    onChange("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box className="prefillCanvas" sx={{ display: "flex", flexDirection: "column" }}>
        {defaultImg?.src || img?.src ? (
          <Box
            sx={{
              cursor: "pointer",
              borderRadius: "12px",
              border: 1,
              borderColor: "outline.variant",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Box
              component="img"
              alt={`image_${widget?.options?.name}`}
              src={img.src || defaultImg?.src}
              draggable="false"
              sx={{
                objectFit: "contain",
                height: "100%",
                width: "100%",
                aspectRatio: "5/2"
              }}
            />
          </Box>
        ) : (
          <Box
            onClick={() => imageRef.current?.click()}
            sx={{
              cursor: "pointer",
              borderRadius: "12px",
              border: 1,
              borderColor: "outline.variant",
              bgcolor: "background.paper",
              overflow: "hidden",
              width: "100%",
              height: "100%",
              aspectRatio: "5/2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              "&:hover": { borderColor: "text.primary" }
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 25, color: "text.primary" }} />
            <Box sx={{ fontSize: "10px", color: "text.primary" }}>
              {t("upload")}
            </Box>
            <Box
              component="input"
              type="file"
              onChange={(e) => onImageChange?.(e, widget)}
              className="filetype"
              accept="image/png,image/jpeg"
              ref={imageRef} // Assign ref dynamically
              required={isRequired}
              sx={{ width: "1px", height: "1px", opacity: 0 }}
            />
          </Box>
        )}
      </Box>
      {(defaultImg?.src || img?.src) && (
        <Link
          component="button"
          type="button"
          onClick={handleClearImage}
          underline="always"
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            color: "info.main",
            cursor: "pointer",
            ml: 0.5,
            width: "fit-content"
          }}
        >
          {t("clear")}
        </Link>
      )}
    </Box>
  );
};
const DrawWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const sigRequiredRef = useRef(null);
  const [hasDraw, setHasDraw] = useState("");
  const [penColor, setPenColor] = useState("blue");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (widget?.response) {
      setImage(widget?.response);
      setHasDraw("signed");
    }
  }, []);

  const handleSignatureChange = () => {
    const draw = canvasRef.current?.isEmpty?.() ? "" : "signed";
    setHasDraw(draw);
    onChange(canvasRef.current.toDataURL());

    // clear custom error once user signs
    sigRequiredRef.current?.setCustomValidity("");
  };

  const handleClear = () => {
    setImage("");
    if (canvasRef?.current) {
      canvasRef.current.clear();
      onChange("");
      setHasDraw("");
      // clear custom error once user signs
      sigRequiredRef.current?.setCustomValidity("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box sx={{ position: "relative", width: "fit-content" }}>
        {image ? (
          <Box className={`prefillCanvas ${canavasTheme}`} sx={{ borderRadius: "10px" }}>
            <Box
              component="img"
              alt={`draw_${widget?.options?.name}`}
              src={image}
              className="prefillCanvas"
              sx={{ objectFit: "contain" }}
            />
          </Box>
        ) : (
          <SignatureCanvas
            ref={canvasRef}
            penColor={penColor}
            canvasProps={{
              className: `prefillCanvas ${canavasTheme} rounded-[10px]`
            }}
            onEnd={() => handleSignatureChange()}
            dotSize={1}
          />
        )}
        {/* ✅ Native form validation hook */}
        <Box
          component="input"
          ref={sigRequiredRef}
          type="text"
          value={hasDraw}
          required={isRequired}
          tabIndex={-1}
          onInvalid={(e) => e.target.setCustomValidity(t("draw-required"))}
          onChange={() => {}}
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0,
            width: "1px",
            height: "1px",
            pointerEvents: "none"
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          mt: 1,
          width: 200
        }}
      >
        <PenColorComponent
          penColor={penColor}
          setPenColor={setPenColor}
          hideLabel
          penSize="sm"
        />
        <Link
          component="button"
          type="button"
          onClick={handleClear}
          underline="always"
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            color: "info.main",
            cursor: "pointer"
          }}
        >
          {t("clear")}
        </Link>
      </Box>
    </Box>
  );
};

const CellsWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const count = widget?.options?.cellCount || 1;
  const [word, setWord] = useState("");
  const inputType = widget?.options?.validation?.type || "";
  const serverRegex = widget?.options?.validation?.pattern;
  const hint = widget?.options?.hint;
  const regExpression = inputValidation(serverRegex, inputType);
  const pattern = useMemo(() => toHtmlPattern(regExpression), [regExpression]);
  useEffect(() => {
    const response =
      widget?.options?.response ?? widget?.options?.defaultValue ?? "";
    setWord(String(response || ""));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setWord(value);
    onChange(value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {showLabel && (
        <WidgetLabel name={widget?.options?.name} isRequired={isRequired} />
      )}
      <Box sx={{ position: "relative" }}>
        <TextField
          type="text"
          placeholder={
            hint || t("enter-value", { value: widget?.options?.name })
          }
          value={word ?? ""}
          onChange={(e) => handleChange(e)}
          size="small"
          fullWidth
          slotProps={{
            htmlInput: {
              pattern: pattern || undefined, // if no pattern, browser won't do pattern validation
              maxLength: count,
              onInvalid: (e) => {
                const el = e.currentTarget;
                // ✅ Only override message if pattern exists AND the error is patternMismatch
                if (pattern && el.validity.patternMismatch) {
                  el.setCustomValidity(t("validation-alert-1"));
                } else {
                  el.setCustomValidity("");
                }
              },
              onInput: (e) => {
                e.currentTarget.setCustomValidity("");
              }
            }
          }}
          sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
        />
      </Box>
    </Box>
  );
};

const RenderWidgets = ({
  widget,
  handleWidgetDetails,
  showLabel = false,
}) => {
  const label = widget?.label?.toLowerCase() ?? "";
  const isPrefill = label.includes(PREFILL_PREFIX);
  const commonProps = {
    widget,
    isRequired: widget.options?.status === "required" && isPrefill,
    showLabel: showLabel,
    onChange: handleWidgetDetails,
  };

  switch (widget.type) {
    case "date":
      return <DateWidget {...commonProps} />;
    case textWidget:
    case textInputWidget:
    case "name":
    case "email":
    case "company":
    case "job title":
    case "number":
      return <TextWidget {...commonProps} />;
    case "checkbox":
      return <CheckboxWidget {...commonProps} />;
    case radioButtonWidget:
      return <RadioButtonWidget {...commonProps} />;
    case "dropdown":
      return <DropdownWidget {...commonProps} />;
    case "image":
    case "stamp":
      return <ImageWidget {...commonProps} />;
    case "initials":
    case "draw":
      return <DrawWidget {...commonProps} />;
    case "cells":
      return <CellsWidget {...commonProps} />;
    default:
      return null;
  }
};

export default memo(RenderWidgets);
