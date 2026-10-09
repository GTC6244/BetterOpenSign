import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  getMonth,
  getYear,
  radioButtonWidget,
  compressedFileSize,
  textWidget,
  months,
  changeDateToMomentFormat,
  convertBase64ToFile,
  generatePdfName,
  drawWidget,
  getBase64MimeType,
  isBase64
} from "../../constant/Utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { range } from "pdf-lib";
import { useTranslation } from "react-i18next";
import moment from "moment";
import AsyncSelect from "react-select/async";
import axios from "axios";
import AddContact from "../../primitives/AddContact";
import Loader from "../../primitives/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  setPrefillImg,
} from "../../redux/reducers/widgetSlice";
import * as utils from "../../utils";
import Draw from "./tab/Draw";
import PenColorComponent from "./tab/PenColorComponent";

const WidgetLabel = ({ required = false, children }) => (
  <Typography
    component="span"
    sx={{ display: "block", fontSize: "0.75rem", fontWeight: 600 }}
  >
    {children}
    {required && (
      <Box component="span" sx={{ color: "error.main" }}>
        {" *"}
      </Box>
    )}
  </Typography>
);
const ShowTextWidget = ({ position, handleWidgetDetails }) => {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(position.options.response || "");

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      fullWidth
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        handleWidgetDetails(position, e.target.value);
      }}
      slotProps={{ htmlInput: { style: { fontSize: "0.75rem" } } }}
    />
  );
};
const ImageComponent = (props) => {
  const { t } = useTranslation();
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const imageRefs = useRef({});

  let imgUrl = "";
  const isBase64Url = isBase64(props?.position?.SignUrl);
  if (isBase64Url) {
    imgUrl = props?.position?.SignUrl;
  } else {
    const getPrefillImg = prefillImg?.find(
      (x) => x.id === props?.position?.key
    );
    imgUrl = getPrefillImg?.base64;
  }

  return (
    <>
      <WidgetLabel required={props?.position?.options?.status === "required"}>
        {props?.position.options?.name}
      </WidgetLabel>
      {imgUrl ? (
        <>
          <Card
            variant="outlined"
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              borderColor: "outline.main"
            }}
          >
            <Box
              component="img"
              alt="print img"
              ref={(el) => (imageRefs.current[props?.id] = el)} // Assign ref dynamicallys
              src={imgUrl}
              draggable="false"
              sx={{
                objectFit: "contain",
                height: "100%",
                width: "100%",
                aspectRatio: "5 / 2"
              }}
              onLoad={() => props?.handleImageLoaded?.(props?.position.key)}
              onError={() => props?.handleImageLoaded?.(props?.position.key)}
            />
          </Card>
          <Link
            component="button"
            type="button"
            underline="always"
            onClick={() => props?.handleClearImage(props?.position)}
            sx={{ alignSelf: "flex-start", cursor: "pointer", fontSize: "inherit" }}
          >
            {t("clear")}
          </Link>
        </>
      ) : (
        <Box
          sx={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            aspectRatio: "5 / 2",
            justifyContent: "center",
            alignItems: "center",
            border: 1,
            borderColor: "outline.main",
            borderRadius: 1,
            "&:hover": { borderColor: "text.primary" }
          }}
          onClick={() => imageRefs.current[props?.id]?.click()}
        >
          <input
            type="file"
            onChange={(e) => props?.onImageChange?.(e, props?.position)}
            className="filetype"
            accept="image/png,image/jpeg"
            ref={(el) => (imageRefs.current[props?.id] = el)} // Assign ref dynamically
            hidden
          />
          <CloudUploadIcon sx={{ fontSize: 25, color: "text.secondary" }} />
          <Box sx={{ fontSize: "10px", color: "text.secondary" }}>
            {t("upload")}
          </Box>
        </Box>
      )}
    </>
  );
};

function PrefillWidgetModal(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const canvasRefs = useRef({});
  const [penColor, setPenColor] = useState("blue");
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  // Track already loaded image keys so they don't increment multiple times
  const loadedSet = useRef(new Set());
  const initializedRef = useRef(false); // prevent rerun on state updates
  const [image, setImage] = useState(null);
  const [currentWidget, setCurrentWidget] = useState("");
  const [userList, setUserList] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const years = range(1950, getYear(new Date()) + 16, 1);

  // useMemo to memoize the calculation of unique widgets
  const uniqueWidget = useMemo(() => {
    //functions to used remove duplicate name values across all pages
    if (!props.prefillData) return [];
    //This will help us track which name values have already been encountered across all pages.
    const uniqueNames = new Set();
    //Filter and flatten placeholder widgets while keeping unique names
    const filteredArray = props.prefillData?.placeHolder?.map((item) => ({
      ...item,
      pos: item.pos.filter((curr) => {
        if (uniqueNames.has(curr?.options?.name)) return false; //Duplicate name found, remove it
        uniqueNames.add(curr?.options?.name); //First time seen, add to set
        return true;
      })
    }));
    // Flatten the filtered array, exclude read-only widgets,
    // carry yPosition for sorting, then sort by pageNumber asc → yPosition asc
    // (mirrors the newSignPos.sort in PdfRequestFiles so widgets appear in
    // the same top-to-bottom, page-1-first order as they do in the document)
    const flatArray = filteredArray
      ?.flatMap((page) =>
        page.pos
          .filter((widget) => !widget.options?.isReadOnly)
          .map((widget) => ({
            widget,
            pageNumber: page.pageNumber,
            yPosition: widget.yPosition ?? 0
          }))
      )
      ?.sort((a, b) =>
        a.pageNumber !== b.pageNumber
          ? a.pageNumber - b.pageNumber  // primary: page order (page 1 first)
          : a.yPosition - b.yPosition    // secondary: top-to-bottom within page
      );

    return flatArray || [];
  }, [props.prefillData]);

  // Reset loader state when modal closes
  useEffect(() => {
    if (!props?.isPrefillModal) {
      initializedRef.current = false;
      setTotalImages(0);
      setLoadedImages(0);
      setLoading(false);
    }
  }, [props?.isPrefillModal]);
  useEffect(() => {
    //function is used to save all image base64 in redux state to display prefill images
    const savePrefillImg = async () => {
      const prefillImage = await utils?.savePrefillImg(props.xyPosition);
      if (Array.isArray(prefillImage)) {
        setLoading(true);
        prefillImage.forEach((img) => dispatch(setPrefillImg(img)));
      }
      setLoading(false);
    };
    savePrefillImg();
  }, [props.xyPosition]);

  useEffect(() => {
    if (totalImages > 0 && loadedImages === totalImages) {
      setLoading(false);
    }
  }, [loadedImages, totalImages]);
  useEffect(() => {
    if (image?.src) {
      handleWidgetDetails(currentWidget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  // Run only once per modal open
  useEffect(() => {
    if (props?.isPrefillModal && !initializedRef.current) {
      const getImgWidgets = uniqueWidget?.filter(
        (w) => w.widget?.type === "image" && w.widget?.options?.response
      );
      if (getImgWidgets?.length > 0) {
        const imgCount = getImgWidgets.length;
        setTotalImages(imgCount);
        setLoadedImages(0);
        setLoading(true);
        initializedRef.current = true; // mark as initialized
      }
    }
  }, [props?.isPrefillModal, uniqueWidget]);
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <Box
      ref={ref}
      onClick={onClick}
      sx={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        cursor: "pointer",
        border: 1,
        borderColor: "outline.main",
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        fontSize: "0.875rem",
        "&:hover": { borderColor: "text.primary" }
      }}
    >
      {value}
      <CalendarMonthIcon sx={{ ml: "5px", fontSize: 16 }} />
    </Box>
  ));
  ExampleCustomInput.displayName = "ExampleCustomInput";

  const handleDate = (position) => {
    // The getDatePickerDate function retrieves the date in the correct format supported by the DatePicker.
    const getDate = utils.getDatePickerDate(
      position?.options.response,
      position?.options?.validation?.format
    );
    return getDate;
  };
  //function to set date with required date format onchange date
  const handleOnDateChange = (date, position) => {
    const format = position?.options?.validation?.format || "MM/dd/yyyy";
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
    handleWidgetDetails(position, newDate);
  };

  const handleSavePrefillImg = async (base64) => {
    setLoading(true);
    try {
      const imageName = generatePdfName(16);
      const imgType = image?.imgType || getBase64MimeType(base64);
      const imageUrl = await convertBase64ToFile(
        imageName,
        base64 || image.src,
        imgType
      );
      if (imageUrl) {
        return imageUrl;
      }
    } catch (e) {
      console.log("error in handleSavePrefillImg function ", e);
    }
  };
  //'buildUpdatedItem' function to update response
  const buildUpdatedItem = (item, widgetDetails, response, imgUrl) => {
    const isImage = widgetDetails?.type === "image";
    const finalResponse = isImage ? imgUrl : response;

    return {
      ...item,
      ...(isImage && {
        SignUrl: imgUrl,
        ImageType: image.imgType
      }),
      options: {
        ...item.options,
        response: finalResponse
      }
    };
  };

  //function is used to handle prefill widgets details and check if there are any duplicate widget name field exist then update all duplicate value
  const handleWidgetDetails = async (widgetDetails, response) => {
    const widgetName = widgetDetails?.options?.name;
    const getPrefill = props.xyPosition.find((x) => x?.Role === "prefill");
    const getPlaceholder = getPrefill?.placeHolder;
    let imgUrl;
    if (widgetDetails?.type === "image") {
      imgUrl = await handleSavePrefillImg(response);
    }
    const updatedData = getPlaceholder.map((page) => ({
      ...page,
      pos: page.pos.map((item) => {
        const isSameKey = item.key === widgetDetails.key;
        const isSameName =
          item.options?.name === widgetName && item.key !== widgetDetails.key;

        // Always update the active widget
        if (isSameKey) {
          return buildUpdatedItem(item, widgetDetails, response, imgUrl);
        }

        // Sync same-name widgets ONLY if response is valid for them
        if (isSameName) {
          const isValidForTarget = utils.isWidgetResponseCompatible({
            ...item,
            options: {
              ...item.options,
              response: widgetDetails?.type === "image" ? imgUrl : response
            }
          });

          if (!isValidForTarget) {
            return item; // skip invalid sync
          }

          return buildUpdatedItem(item, widgetDetails, response, imgUrl);
        }

        return item;
      })
    }));
    const newUpdateSigner = props.xyPosition.map((obj) =>
      obj.Role === "prefill" ? { ...obj, placeHolder: updatedData } : obj
    );

    props.setXyPosition(newUpdateSigner);
  };

  //function for set checked and unchecked value of checkbox
  const handleCheckboxValue = (isChecked, ind, position) => {
     let updateSelectedCheckbox = [];
    updateSelectedCheckbox =
      position.options?.defaultValue || position.options?.response || [];
    if (isChecked) {
      updateSelectedCheckbox.push(ind);
    } else {
      updateSelectedCheckbox = updateSelectedCheckbox.filter(
        (data) => data !== ind
      );
    }
    handleWidgetDetails(position, updateSelectedCheckbox);
  };

  //function for image upload or update
  const onImageChange = (event, position) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      compressedFileSize(file, setImage);
      setCurrentWidget(position);
    }
  };
  const handleRadioCheck = (data, position) => {
    const res = position?.options?.response;
    const defaultCheck = position?.options?.defaultValue;
    if (res === data || defaultCheck === data) {
      return true;
    } else {
      return false;
    }
  };

  //function for show checked checkbox
  const selectCheckbox = (ind, position) => {
    const res = position?.options?.response;
    const defaultCheck = position?.options?.defaultValue;
    if (res && res?.length > 0) {
      const isSelectIndex = res.indexOf(ind);
      if (isSelectIndex > -1) {
        return true;
      } else {
        return false;
      }
    } else if (defaultCheck) {
      const isSelectIndex = defaultCheck.indexOf(ind);
      if (isSelectIndex > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  const handleClearImage = (position) => {
    let prefillPlaceholder = props?.xyPosition.filter(
      (data) => data?.Role === "prefill"
    );
    const updatedArray = prefillPlaceholder[0]?.placeHolder?.map((page) => ({
      ...page,
      pos: page.pos.map((item) => {
        if (item.options.name === position.options.name) {
          return {
            ...item,
            ...(item.SignUrl !== undefined && { SignUrl: "" }),
            options: {
              ...position.options,
              response: ""
            }
          };
        }
        return item;
      })
    }));
    const newUpdateSigner = props.xyPosition.map((obj) => {
      if (obj.Role === "prefill") {
        return { ...obj, placeHolder: updatedArray };
      }
      return obj;
    });
    props.setXyPosition(newUpdateSigner);
  };
  const handleImageLoaded = (key) => {
    // Prevent counting the same image multiple times.
    // If this image (key) has not already been marked as loaded...
    if (!loadedSet.current.has(key)) {
      // Mark this image as loaded by adding its key to the Set
      loadedSet.current.add(key);
      // Increment the loadedImages state by 1
      // (tracks how many images have finished loading)
      setLoadedImages((prev) => prev + 1);
    }
    setLoading(false);
  };
  //function for set signature url
  const handleSignatureChange = (drawImage, position) => {
    handleWidgetDetails(position, drawImage);
  };
  const getCanvasRef = (widgetId) => {
    if (!canvasRefs.current[widgetId]) {
      canvasRefs.current[widgetId] = React.createRef();
    }
    return canvasRefs.current[widgetId];
  };
  const clearCanvasById = (widgetId) => {
    const canvasRef = canvasRefs.current?.[widgetId];

    if (canvasRef?.current) {
      canvasRef.current.clear();
    }
  };
  const handleWidgetType = (position, id) => {
    switch (position?.type) {
      case "checkbox":
        return (
          <>
            <WidgetLabel required={position?.options?.status === "required"}>
              {position.options?.name}
            </WidgetLabel>
            <Stack spacing={0.5}>
              {position.options?.values?.map((data, ind) => (
                <FormControlLabel
                  key={ind}
                  className="select-none-cls"
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      id={`modal-checkbox-${position.key + ind}`}
                      size="small"
                      checked={selectCheckbox(ind, position)}
                      onChange={(e) =>
                        handleCheckboxValue(e.target.checked, ind, position)
                      }
                      sx={{ p: 0.25 }}
                    />
                  }
                  label={data}
                  slotProps={{
                    typography: { sx: { fontSize: "0.75rem", ml: "3px" } }
                  }}
                />
              ))}
            </Stack>
          </>
        );
      case textWidget:
        return (
          <>
            <WidgetLabel required={position?.options?.status === "required"}>
              {position.options?.name}
            </WidgetLabel>
            <ShowTextWidget
              position={position}
              handleWidgetDetails={handleWidgetDetails}
            />
          </>
        );
      case "dropdown":
        return (
          <>
            <WidgetLabel required={position?.options?.status === "required"}>
              {position.options?.name}
            </WidgetLabel>
            <TextField
              select
              size="small"
              fullWidth
              id="myDropdown"
              value={
                position?.options?.response ||
                position?.options?.defaultValue ||
                ""
              }
              onChange={(e) => handleWidgetDetails(position, e.target.value)}
              slotProps={{ select: { native: true } }}
            >
              {/* Default/Title option */}
              <option value="" disabled hidden>
                {t("choose-one")}
              </option>
              {position?.options?.values?.map((data, ind) => (
                <option key={ind} value={data}>
                  {data}
                </option>
              ))}
            </TextField>
          </>
        );
      case "date":
        return (
          <>
            <WidgetLabel required={position?.options?.status === "required"}>
              {position.options?.name}
            </WidgetLabel>
            <DatePicker
              portalId="datepicker-portal-root"
              renderCustomHeader={({ date, changeYear, changeMonth }) => (
                <Box sx={{ display: "flex", justifyContent: "flex-start", ml: 1 }}>
                  <Box
                    component="select"
                    sx={{ bgcolor: "transparent", border: 0, outline: "none" }}
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
                    sx={{ bgcolor: "transparent", border: 0, outline: "none" }}
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
              closeOnScroll={true}
              selected={handleDate(position)}
              onChange={(date) => handleOnDateChange(date, position)}
              customInput={<ExampleCustomInput />}
              dateFormat={position?.options?.validation?.format || "MM/dd/yyyy"}
            />
          </>
        );
      case "image":
        return (
          <ImageComponent
            position={position}
            onImageChange={onImageChange}
            handleImageLoaded={handleImageLoaded}
            handleClearImage={handleClearImage}
            id={id}
          />
        );
      case radioButtonWidget:
        return (
          <>
            <WidgetLabel required={position?.options?.status === "required"}>
              {position.options?.name}
            </WidgetLabel>
            <Stack spacing={0.5}>
              {position.options?.values.map((data, ind) => (
                <FormControlLabel
                  key={ind}
                  className="select-none-cls"
                  sx={{ m: 0 }}
                  control={
                    <Radio
                      id={`modal-radio-${position.key + ind}`}
                      size="small"
                      checked={handleRadioCheck(data, position)}
                      onChange={() => handleWidgetDetails(position, data)}
                      sx={{ p: 0.25 }}
                    />
                  }
                  label={data}
                  slotProps={{
                    typography: { sx: { fontSize: "0.75rem", ml: "2px" } }
                  }}
                />
              ))}
            </Stack>
          </>
        );
      case drawWidget:
        return (
          <Box>
            <WidgetLabel required={position?.options?.status === "required"}>
              {position.options?.name}
            </WidgetLabel>
            <Draw
              key={position.key + "_" + (prefillImg?.length || 0)}
              penColor={penColor}
              canvasRef={getCanvasRef(position.key)}
              currWidgetsDetails={position}
              handleSignatureChange={handleSignatureChange}
              prefillCls={"prefillCanvas"}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                mt: "10px"
              }}
            >
              <PenColorComponent
                penColor={penColor}
                setPenColor={setPenColor}
              />
              <Link
                component="button"
                type="button"
                underline="always"
                onClick={() => {
                  clearCanvasById(position?.key);
                  handleClearImage(position);
                }}
                sx={{ alignSelf: "flex-start", cursor: "pointer", fontSize: "inherit" }}
              >
                {t("clear")}
              </Link>
            </Box>
          </Box>
        );
      default:
        return position?.SignUrl ? (
          <Box sx={{ pointerEvents: "none" }}>
            <Box
              component="img"
              alt="image"
              draggable="false"
              src={position?.SignUrl}
              sx={{ width: "100%", height: "100%" }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              border: 1,
              borderColor: "outline.main",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              fontSize: "0.875rem",
              color: "text.secondary"
            }}
          >
            No widget
          </Box>
        );
    }
  };

  const handleEmbedPrefill = async (item) => {
    //checking is there any draw widget response have base64 url then generate that base64 to url and save it
    const prefillWidgets = props.xyPosition?.find((x) => x.Role === "prefill");
    let updatedXyPosition = [];
    if (prefillWidgets) {
      const isDrawWidget = (prefillWidgets.placeHolder ?? []).some((ph) =>
        (ph?.pos ?? []).some((p) => p?.type === drawWidget)
      );
      if (isDrawWidget) {
        const getPrefill = props.xyPosition.find((x) => x?.Role === "prefill");
        const getPlaceholder = getPrefill?.placeHolder ?? [];
        const updatedData = await Promise.all(
          getPlaceholder.map(async (page) => ({
            ...page,
            pos: await Promise.all(
              page.pos.map(async (item) => {
                if (item?.type === drawWidget) {
                  const widgetResponse = item?.options?.response;

                  // Skip if no response
                  if (!widgetResponse) return item;

                  // If already URL, do not re-upload
                  if (
                    typeof widgetResponse === "string" &&
                    widgetResponse.startsWith("http")
                  ) {
                    return item;
                  }

                  // Convert THIS widget's base64 → URL
                  const drawUrl = await handleSavePrefillImg(widgetResponse);
                  return {
                    ...item,
                    options: {
                      ...item.options,
                      response: drawUrl
                    }
                  };
                }

                return item;
              })
            )
          }))
        );

        updatedXyPosition = props.xyPosition.map((obj) => {
          if (obj.Role === "prefill") {
            return {
              ...obj,
              placeHolder: updatedData
            };
          }
          return obj;
        });

        props.setXyPosition(updatedXyPosition);
      }
    }

      await props.handleCreateDocument();
  };
  //`loadOptions` function to use show all list of signer in dropdown
  const loadOptions = async (inputValue) => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/getsigners`;

      const token =
            { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      };
      const search = inputValue;
      const axiosRes = await axios.post(url, { search }, { headers });
      const contactRes = axiosRes?.data?.result || [];
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        const result = res;
        setUserList(result);
        return await result.map((item) => ({
          label: `${item.Name}<${item.Email}>`,
          value: item.objectId
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  //`handleInputChange` function to get signers list from dropdown
  const handleInputChange = (item, id) => {
    const signerExist = props.forms.some((x) => x.label === item.label);
    if (signerExist) {
      alert(t("already-exist-signer"));
    } else {
      let newForm = [...props.forms];
      let signerId = newForm[id].value;
      newForm[id].label = item?.label;
      // newForm[id].value = item?.value;
      props.setForms(newForm);
      const getSigner = userList.find((x) => x.objectId === item.value);
      props.handleAddUser(getSigner, signerId);
    }
  };
  //show modal to create new contact
  const handleCreateNew = (e, id) => {
    e.preventDefault();
    props.setIsNewContact({ status: true, id: id });
  };
  const closePopup = () => {
    props.setIsNewContact({ status: false, id: "" });
  };
  return (
    <>
      <ModalUi
        title={uniqueWidget?.length > 0 ? t("prefill-widget") : "Recipients"}
        isOpen={true}
        handleClose={props.handleClosePrefillModal}
      >
        <Box sx={{ position: "relative" }}>
          {(props?.isSubmit || loading) && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 9999
              }}
            >
              <Loader />
            </Box>
          )}
          {uniqueWidget?.length > 0 && (
            <Card
              variant="outlined"
              sx={{
                py: 1.5,
                px: "10px",
                m: { xs: 1.5, md: 3 },
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderColor: "outline.main"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  columnGap: 5,
                  rowGap: 2,
                  width: "100%"
                }}
              >
                {uniqueWidget.map((x, id) => (
                  <Box
                    key={id}
                    sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}
                  >
                    {handleWidgetType(x.widget, id)}
                  </Box>
                ))}
              </Box>
            </Card>
          )}

          <Box>
            {props.forms.length > 0 && (
              <Box sx={{ overflowY: "auto", m: 1.5 }}>
                {uniqueWidget?.length > 0 && (
                  <Typography
                    component="h1"
                    sx={{ fontWeight: 500, fontSize: "15px", mb: 1 }}
                  >
                    {t("recipients")}
                  </Typography>
                )}
                <Card
                  variant="outlined"
                  sx={{
                    py: 1.5,
                    px: "10px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    borderColor: "outline.main"
                  }}
                >
                  {props.forms?.map((field, id) => {
                    return (
                      <Box sx={{ display: "flex", flexDirection: "column" }} key={field?.value}>
                        <Typography component="label">{field?.role}</Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 0.5
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <AsyncSelect
                              cacheOptions
                              defaultOptions
                              value={field}
                              loadingMessage={() => t("loading")}
                              noOptionsMessage={() => t("contact-not-found")}
                              loadOptions={loadOptions}
                              onChange={(item) => handleInputChange(item, id)}
                              unstyled
                              onFocus={() => loadOptions()}
                              classNames={{
                                control: () =>
                                  "op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]",
                                valueContainer: () =>
                                  "flex flex-row gap-x-[2px] gap-y-[2px] md:gap-y-0 w-full my-[2px]",
                                multiValue: () =>
                                  "op-badge op-badge-primary h-full text-[11px]",
                                multiValueLabel: () => "mb-[2px]",
                                menu: () =>
                                  "mt-1 shadow-md rounded-lg bg-base-200 text-base-content absolute z-9999",
                                menuList: () => "shadow-md rounded-lg",
                                option: () =>
                                  "bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2",
                                noOptionsMessage: () =>
                                  "p-2 bg-base-200 rounded-lg m-1 p-2"
                              }}
                              menuPortalTarget={document.getElementById(
                                "selectSignerModal"
                              )}
                            />
                          </Box>
                          <IconButton
                            onClick={(e) => handleCreateNew(e, field.value)}
                            color="secondary"
                            size="small"
                            sx={{
                              border: 1,
                              borderColor: "secondary.main",
                              borderRadius: 1
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}
                </Card>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, mx: 2, mb: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={props?.isSubmit}
              sx={{ width: "80px" }}
              onClick={() => handleEmbedPrefill(props?.item)}
            >
              {t("next")}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => props.navigatePageToDoc()}
            >
              {t("edit-draft")}
            </Button>
          </Box>
        </Box>
      </ModalUi>
      <ModalUi
        title={t("add-contact")}
        isOpen={props.isNewContact.status}
        handleClose={closePopup}
      >
        <AddContact
          isDisableTitle
          isAddYourSelfCheckbox
          details={props.handleAddUser}
          closePopup={closePopup}
          newContactId={props.isNewContact.id}
        />
      </ModalUi>
    </>
  );
}

export default PrefillWidgetModal;