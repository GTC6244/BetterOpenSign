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
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ModalUi from "../../primitives/ModalUi";
import { radioButtonWidget } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";

function DropdownWidgetOption(props) {
  const { t } = useTranslation();
  const [dropdownOptionList, setDropdownOptionList] = useState([
    "Option-1",
    "Option-2"
  ]);
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [dropdownName, setDropdownName] = useState();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isHideLabel, setIsHideLabel] = useState(false);
  const [status, setStatus] = useState("required");
  const [defaultValue, setDefaultValue] = useState("");
  const [defaultCheckbox, setDefaultCheckbox] = useState([]);
  const [layout, setLayout] = useState("vertical");
  const statusArr = ["required", "optional"];
  const layoutArr = ["vertical", "horizontal"];
  const isPrefillExist = props?.roleName === "prefill";


  const resetState = () => {
    setDropdownOptionList(["Option-1", "Option-2"]);
    setDropdownName(props.currWidgetsDetails?.options?.name || props.type);
    setIsReadOnly(false);
    setIsHideLabel(false);
    setMinCount(0);
    setMaxCount(0);
    setDefaultCheckbox([]);
    setDefaultValue("");
    setLayout("vertical");
  };
  useEffect(() => {
    if (
      props.currWidgetsDetails?.options?.name &&
      props.currWidgetsDetails?.options?.values?.length > 0
    ) {
      setDropdownName(props.currWidgetsDetails?.options?.name);
      setDropdownOptionList(props.currWidgetsDetails?.options?.values);
      setMinCount(
        props.currWidgetsDetails?.options?.validation?.minRequiredCount
      );
      setMaxCount(
        props.currWidgetsDetails?.options?.validation?.maxRequiredCount
      );
      setIsReadOnly(props.currWidgetsDetails?.options?.isReadOnly);
      setIsHideLabel(props.currWidgetsDetails?.options?.isHideLabel);
      setStatus(props.currWidgetsDetails?.options?.status || "required");
      setDefaultValue(props.currWidgetsDetails?.options?.defaultValue || "");
      setDefaultCheckbox(props.currWidgetsDetails?.options?.defaultValue || []);
      setLayout(props.currWidgetsDetails?.options?.layout || "vertical");
    } else {
      setStatus("required");
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currWidgetsDetails]);
  const handleInputChange = (index, value) => {
    setDropdownOptionList((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index] = value;
      return newInputs;
    });
  };

  //function add add checkbox option and add width of checkbox
  const handleAddInput = () => {
    const deleteOption = false;
    const addOption = true;
    setDropdownOptionList((prevInputs) => [...prevInputs, ""]);
    props.handleSaveWidgetsOptions(
      null,
      null,
      null,
      null,
      null,
      addOption,
      deleteOption
    );
  };

  //function add add checkbox option and delete width of checkbox
  const handleDeleteInput = (ind) => {
    const deleteOption = true;
    const addOption = false;
    const getUpdatedOptions = dropdownOptionList.filter(
      (_, index) => index !== ind
    );
    setDropdownOptionList(getUpdatedOptions);
    props.handleSaveWidgetsOptions(
      null,
      null,
      null,
      null,
      null,
      addOption,
      deleteOption
    );
  };

  const handleSaveOption = () => {
    if (["checkbox", radioButtonWidget, "dropdown"].includes(props.type)) {
      const allUnique =
        new Set(dropdownOptionList).size === dropdownOptionList.length;
      if (!allUnique) {
        alert("Please remove duplicate option");
        return;
      }
    }

    const isDropdownOrRadio =
      props?.type === "dropdown" || props?.type === radioButtonWidget;
    const isCheckbox = props?.type === "checkbox";

    const defaultData = isCheckbox ? defaultCheckbox : defaultValue;

    const readOnlyWithoutValue =
      isReadOnly && !defaultValue && status !== "optional";
    const WidgetLayout = ["checkbox", radioButtonWidget].includes(props.type)
      ? layout
      : null;

    // If it’s a dropdown and it’s read-only without a value (nor marked optional), stop here.
    if (isDropdownOrRadio && readOnlyWithoutValue) {
      alert(t("readonly-error", { widgetName: props?.type }));
      return;
    } else if (
      isCheckbox &&
      isReadOnly &&
      minCount > 0 &&
      defaultCheckbox?.length === 0
    ) {
      alert(t("readonly-error", { widgetName: props?.type }));
      return;
    }

    // Otherwise (either not a dropdown, or a valid dropdown), do the save + reset exactly once.
    props.handleSaveWidgetsOptions(
      dropdownName,
      dropdownOptionList,
      minCount,
      maxCount,
      isReadOnly,
      null,
      null,
      status,
      defaultData,
      isHideLabel,
      WidgetLayout,
    );
    resetState();
  };


  const handleSelectDefaultCheckbox = (e, index) => {
    const checked = e.target.checked;
    setDefaultCheckbox((prev) =>
      checked
        ? prev.includes(index)
          ? prev
          : [...prev, index]
        : prev.filter((i) => i !== index)
    );
  };
  return (
    <ModalUi isOpen={props.showDropdown} title={props.title} showClose={false}>
      <Box sx={{ height: "100%", p: "15px", color: "text.primary" }}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveOption();
          }}
        >
          <Box>
            <Typography
              component="label"
              htmlFor="title"
              sx={{ fontSize: "13px", fontWeight: 600 }}
            >
              {t("name")}
              <Box component="span" sx={{ color: "error.main", fontSize: "13px" }}>
                {" "}
                *
              </Box>
            </Typography>
            <TextField
              id="title"
              size="small"
              fullWidth
              value={dropdownName}
              onChange={(e) => setDropdownName(e.target.value)}
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

            <Typography
              component="label"
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                mt: "5px",
                display: "block"
              }}
            >
              {t("options")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {dropdownOptionList?.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    mb: "5px",
                    alignItems: "center"
                  }}
                >
                  {props.type === "checkbox" && props.isShowAdvanceFeature && (
                    <Checkbox
                      size="small"
                      checked={defaultCheckbox?.includes(index)}
                      onChange={(e) => handleSelectDefaultCheckbox(e, index)}
                      sx={{ mr: "5px", p: 0.5 }}
                    />
                  )}
                  <TextField
                    size="small"
                    fullWidth
                    type="text"
                    value={option}
                    onChange={(e) => handleInputChange(index, e.target.value)}
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

                  <IconButton
                    aria-label="Delete option"
                    color="secondary"
                    onClick={() => handleDeleteInput(index)}
                    sx={{ ml: "10px" }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
              <Box>
                <IconButton
                  aria-label="Add option"
                  color="primary"
                  onClick={handleAddInput}
                  sx={{ ml: "10px" }}
                >
                  <AddBoxOutlinedIcon />
                </IconButton>
              </Box>
            </Box>
            {["dropdown", radioButtonWidget].includes(props.type) &&
              !isPrefillExist && (
                <>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      mt: "5px",
                      display: "block"
                    }}
                  >
                    {t("default-value")}
                  </Typography>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    name="defaultvalue"
                    slotProps={{ htmlInput: { sx: { fontSize: "0.75rem" } } }}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: "13px" }}>
                      {t("select")}...
                    </MenuItem>
                    {dropdownOptionList.map((data, ind) => {
                      return (
                        <MenuItem
                          key={ind}
                          value={data}
                          sx={{ fontSize: "13px" }}
                        >
                          {data}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </>
              )}
            {((props.type !== "checkbox" && !isPrefillExist) ||
              isPrefillExist) && (
              <Stack direction="row" spacing="10px" sx={{ mt: "0.5rem" }}>
                {statusArr.map((data, ind) => (
                  <FormControlLabel
                    key={ind}
                    sx={{ m: 0 }}
                    control={
                      <Radio
                        size="small"
                        name="status"
                        onChange={() => setStatus(data.toLowerCase())}
                        checked={status.toLowerCase() === data.toLowerCase()}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 500,
                          textTransform: "capitalize"
                        }}
                      >
                        {data}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            )}
            <Box
              sx={{ display: "flex", alignItems: "center", mt: 1.5, mb: 1.5 }}
            >
              <Box component="span">{t("font-size")} :</Box>
              <TextField
                select
                size="small"
                value={
                  props.fontSize ||
                  props.currWidgetsDetails?.options?.fontSize ||
                  12
                }
                onChange={(e) => props.setFontSize(parseInt(e.target.value))}
                sx={{ ml: "7px" }}
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 0.5,
                  alignItems: "center",
                  ml: 2
                }}
              >
                <Box component="span" sx={{ textTransform: "capitalize" }}>
                  {t("color")} :{" "}
                </Box>
                <TextField
                  select
                  size="small"
                  value={
                    props.fontColor ||
                    props.currWidgetsDetails?.options?.fontColor ||
                    "black"
                  }
                  onChange={(e) => props.setFontColor(e.target.value)}
                  sx={{ ml: "7px" }}
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
                      props.currWidgetsDetails?.options?.fontColor ||
                      "black"
                  }}
                ></Box>
              </Box>
            </Box>
            {["checkbox", radioButtonWidget, "dropdown"].includes(
              props.type
            ) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2.5,
                  my: 1,
                  alignItems: "center",
                  textAlign: "center"
                }}
              >
                {props.isShowAdvanceFeature && !isPrefillExist && (
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        id="isreadonly"
                        size="small"
                        checked={isReadOnly}
                        onChange={(e) => setIsReadOnly(e.target.checked)}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ textTransform: "capitalize" }}>
                        {t("read-only")}
                      </Typography>
                    }
                  />
                )}
                {props.type !== "dropdown" && (
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        id="ishidelabel"
                        size="small"
                        checked={isHideLabel}
                        onChange={(e) => setIsHideLabel(e.target.checked)}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ textTransform: "capitalize" }}>
                        {t("hide-labels")}
                      </Typography>
                    }
                  />
                )}
              </Box>
            )}
            {["checkbox", radioButtonWidget].includes(props.type) && (
              <>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    mt: "5px",
                    textTransform: "capitalize"
                  }}
                >
                  {t("layout")}
                </Typography>
                <Stack
                  direction="row"
                  spacing="10px"
                  sx={{
                    mb: props.type === "checkbox" ? "10px" : 0,
                    mt: "0.5rem"
                  }}
                >
                  {layoutArr.map((data, ind) => (
                    <FormControlLabel
                      key={ind}
                      sx={{ m: 0 }}
                      control={
                        <Radio
                          size="small"
                          name="layout"
                          checked={layout.toLowerCase() === data.toLowerCase()}
                          onChange={() => setLayout(data.toLowerCase())}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                          {t(data)}
                        </Typography>
                      }
                    />
                  ))}
                </Stack>
              </>
            )}
          </Box>
          <Divider
            sx={{
              my:
                props.type === "checkbox" && props.isShowAdvanceFeature
                  ? 0
                  : "15px",
              mb:
                props.type === "checkbox" && props.isShowAdvanceFeature
                  ? "15px"
                  : undefined
            }}
          />


          <Button
            disabled={dropdownOptionList.length === 0 && true}
            type="submit"
            variant="contained"
          >
            {t("save")}
          </Button>
          {props.currWidgetsDetails?.options?.values?.length > 0 && (
            <Button
              type="submit"
              variant="text"
              color="inherit"
              sx={{ ml: 1 }}
              onClick={() => {
                props.handleClose && props.handleClose();
                resetState();
              }}
            >
              {t("cancel")}
            </Button>
          )}
        </Box>
      </Box>
    </ModalUi>
  );
}

export default DropdownWidgetOption;
