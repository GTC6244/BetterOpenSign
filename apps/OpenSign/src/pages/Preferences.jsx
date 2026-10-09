import React, { useEffect, useState } from "react";
import Alert from "../primitives/Alert";
import { useTranslation } from "react-i18next";
import Loader from "../primitives/Loader";
import Tooltip from "../primitives/Tooltip";
import {
  getTenantDetails,
  handleSignatureType,
  signatureTypes,
  usertimezone
} from "../constant/Utils";
import Parse from "parse";
import { Tooltip as ReactTooltip } from "react-tooltip";
import TimezoneSelector from "../components/preferences/TimezoneSelector";
import DateFormatSelector from "../components/preferences/DateFormatSelector";
import FilenameFormatSelector from "../components/preferences/FilenameFormatSelector";
import axios from "axios";
import { withSessionValidation } from "../utils";
import { WidgetsTab, EmailTab } from "../components/preferences/tabs";
import {
  setUserInfo,
  setTenantInfo,
  setLoader,
  setTopLoader,
  setAlertInfo
} from "../redux/reducers/userReducer";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

const HelpIcon = () => (
  <Box
    component="i"
    className="fa-light fa-question"
    sx={{
      borderRadius: "9999px",
      border: 1,
      borderColor: "info.main",
      color: "info.main",
      fontSize: "13px",
      py: "1.5px",
      px: "4px"
    }}
  />
);

const Preferences = () => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoader, isTopLoader, alertInfo } = useSelector(
    (state) => state.user
  );
  const [signatureType, setSignatureType] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [isNotifyOnSignatures, setIsNotifyOnSignatures] = useState();
  const [timezone, setTimezone] = useState(usertimezone);
  const [activeTab, setactiveTab] = useState(0);
  const generaltab = {
    name: "general",
    title: t("general"),
    icon: "fa-light fa-gears"
  };
  const [tab, setTab] = useState([generaltab]);
  const [sendinOrder, setSendinOrder] = useState(true);
  const [isTourEnabled, setIsTourEnabled] = useState(false);
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [is12HourTime, setIs12HourTime] = useState(false);
  const [isLTVEnabled, setIsLTVEnabled] = useState(false);
  const [fileNameFormat, setFileNameFormat] = useState("DOCNAME");
  const [useNameAsSender, setUseNameAsSender] = useState(false);

  useEffect(() => {
    fetchSignType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showAlert = (type, msg) => {
    dispatch(setAlertInfo({ type, msg }));
    setTimeout(() => {
      dispatch(setAlertInfo({ type: "success", msg: "" }));
    }, 2000);
  };

  const fetchSignType = withSessionValidation(async () => {
    dispatch(setTopLoader(true));
    const EmailTab = [
      { name: "email", title: t("email"), icon: "fa-light fa-envelope" }
    ];

    const arr = [
      generaltab,
      { name: "widgets", title: t("widgets"), icon: "fa-light fa-list" },
      ...EmailTab,
    ];
    setTab(arr);
    try {
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const tenantDetails = await getTenantDetails(user?.objectId);
      dispatch(setTenantInfo(tenantDetails));
      const signatureType = tenantDetails?.SignatureType || [];
      const tenantSignTypes = signatureType?.filter((x) => x.enabled === true);
      const extUser = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getUserDetails`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      );
      const getUser = extUser?.data?.result;
      if (!getUser) {
        setErrMsg(t("something-went-wrong-mssg"));
        return;
      }
      const _getUser = JSON.parse(JSON.stringify(getUser));
      dispatch(setUserInfo(_getUser));
      setIsNotifyOnSignatures(
        _getUser?.NotifyOnSignatures !== undefined
          ? _getUser?.NotifyOnSignatures
          : true
      );
      setTimezone(_getUser?.Timezone || usertimezone);
      if (tenantSignTypes?.length > 0) {
        const signatureType = _getUser?.SignatureType || signatureTypes;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          signatureType
        );
        setSignatureType(updatedSignatureType);
      } else {
        setSignatureType(_getUser?.SignatureType || signatureTypes);
      }
      setSendinOrder(
        _getUser?.SendinOrder !== undefined ? _getUser?.SendinOrder : true
      );
      setIsTourEnabled(
        _getUser?.IsTourEnabled !== undefined ? _getUser?.IsTourEnabled : true
      );
      setDateFormat(
        _getUser?.DateFormat !== undefined ? _getUser?.DateFormat : "MM/DD/YYYY"
      );
      setIs12HourTime(
        _getUser?.Is12HourTime !== undefined ? _getUser?.Is12HourTime : false
      );
      setIsLTVEnabled(
        _getUser?.IsLTVEnabled !== undefined ? _getUser?.IsLTVEnabled : false
      );
      const downloadFilenameFormat =
        _getUser?.DownloadFilenameFormat || "DOCNAME";
      setFileNameFormat(downloadFilenameFormat);
      setUseNameAsSender(_getUser?.UseNameAsSender === true);
    } catch (err) {
      console.error("Error while getting user details: ", err);
      setErrMsg(t("something-went-wrong-mssg"));
    } finally {
      dispatch(setTopLoader(false));
    }
  });

  // `handleCheckboxChange` is trigger when user enable/disable checkbox of respective type
  const handleCheckboxChange = (index) => {
    // // Create a copy of the signatureType array
    // const updatedSignatureType = [...signatureType];
    // // Toggle the enabled value for the clicked item
    // updatedSignatureType[index].enabled = !updatedSignatureType[index].enabled;
    // // Update the state with the modified array
    // setSignatureType(updatedSignatureType);

    setSignatureType((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // `handleSave` is used save updated value signature type
  const handleSave = withSessionValidation(async () => {
    dispatch(setLoader(true));
    const Timezone = timezone || usertimezone;
    if (
      signatureType.length > 0 ||
      isNotifyOnSignatures !== undefined ||
      Timezone
    ) {
      let params = { Timezone: Timezone };
      if (signatureType.length > 0) {
        const enabledSignTypes = signatureType?.filter((x) => x.enabled);
        const isDefaultSignTypeOnly =
          enabledSignTypes?.length === 1 &&
          enabledSignTypes[0]?.name === "default";
        if (enabledSignTypes.length === 0) {
          showAlert("danger", t("at-least-one-signature-type"));
          dispatch(setLoader(false));
          return;
        } else if (isDefaultSignTypeOnly) {
          showAlert("danger", t("expect-default-one-signature-type"));
          dispatch(setLoader(false));
          return;
        } else {
          params = { ...params, SignatureType: signatureType };
        }
      }
      if (isNotifyOnSignatures !== undefined) {
        params = { ...params, NotifyOnSignatures: isNotifyOnSignatures };
      }
      try {
        params = {
          ...params,
          SendinOrder: sendinOrder,
          IsTourEnabled: isTourEnabled,
          DateFormat: dateFormat,
          Is12HourTime: is12HourTime,
          IsLTVEnabled: isLTVEnabled,
          DownloadFilenameFormat: fileNameFormat,
          UseNameAsSender: useNameAsSender,
        };
        const updateRes = await Parse.Cloud.run("updatepreferences", params);
        if (updateRes) {
          showAlert("success", t("saved-successfully"));
          let extUser =
            localStorage.getItem("Extand_Class") &&
            JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
          if (extUser && extUser?.objectId) {
            extUser.NotifyOnSignatures = isNotifyOnSignatures;
            extUser.SendinOrder = sendinOrder;
            extUser.IsTourEnabled = isTourEnabled;
            extUser.DateFormat = dateFormat;
            extUser.Is12HourTime = is12HourTime;
            extUser.DownloadFilenameFormat = fileNameFormat;
            extUser.UseNameAsSender = useNameAsSender;
            const _extUser = JSON.parse(JSON.stringify(extUser));
            localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
          }
        }
      } catch (err) {
        console.error("Error updating signature type: ", err);
        showAlert("danger", err.message);
      }
      dispatch(setLoader(false));
    }
  });

  // `handleNotifySignChange` is trigger when user change radio of notify on signatures
  const handleNotifySignChange = (value) => {
    setIsNotifyOnSignatures(value);
  };


  const handleTourInput = () => setIsTourEnabled(!isTourEnabled);
  const handleSendinOrderInput = () => setSendinOrder(!sendinOrder);
  const tabName = (ind) => tab.find((t, i) => i === ind)?.name;

  return (
    <React.Fragment>
      {alertInfo.msg && <Alert type={alertInfo.type}>{alertInfo.msg}</Alert>}
      {isTopLoader ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
          }}
        >
          <Loader />
        </Box>
      ) : (
        <>
          {errMsg ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
              }}
            >
              {errMsg}
            </Box>
          ) : (
            <Box
              sx={{
                position: "relative",
                bgcolor: "background.paper",
                color: "text.primary",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: 3,
                borderRadius: 3,
                mb: 3
              }}
            >
              {isLoader && (
                <Box
                  sx={{
                    display: "flex",
                    zIndex: 100,
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 3,
                    bgcolor: "rgba(0,0,0,0.3)"
                  }}
                >
                  <Loader />
                </Box>
              )}
              <Typography
                variant="h6"
                sx={{
                  ml: 2,
                  mt: 1.5,
                  fontSize: "1.125rem",
                  mb: 1,
                  fontWeight: 600
                }}
              >
                {appName} {t("Preferences")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 1
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, v) => setactiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="preferences tabs"
                >
                  {tab.map((tabData, ind) => (
                    <Tab
                      key={ind}
                      icon={<i className={tabData.icon} />}
                      iconPosition="start"
                      label={tabData.title}
                      id={`tab-${ind}`}
                      aria-controls={`panel-${tabData.title}`}
                      sx={{ minHeight: 48, textTransform: "none" }}
                    />
                  ))}
                </Tabs>
              </Box>
              <Box
                id={`panel-${activeTab}`}
                sx={{ px: 3, pt: 2, pb: 3 }}
                aria-labelledby={`tab-${activeTab}`}
                role="tabpanel"
              >
                {tabName(activeTab) === "general" && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
                      columnGap: { md: 4 }
                    }}
                  >
                    {/* Left Column - Signature Settings */}
                    <Box
                      sx={{
                        gridColumn: { md: "span 5" },
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      {/* Signature Types Section */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          component="label"
                          htmlFor="signaturetype"
                          sx={{ fontSize: "14px", mb: "0.7rem", fontWeight: 500 }}
                        >
                          {t("allowed-signature-types")}
                          <a
                            data-tooltip-id="signtypes-tooltip"
                            className="ml-1"
                          >
                            <sup>
                              <HelpIcon />
                            </sup>
                          </a>
                          <ReactTooltip
                            id="signtypes-tooltip"
                            className="z-[999]"
                          >
                            <div className="max-w-[200px] md:max-w-[450px]">
                              <p className="font-bold">
                                {t("allowed-signature-types")}
                              </p>
                              <p>{t("allowed-signature-types-help.p1")}</p>
                              <div className="p-[5px] ml-2">
                                <ol className="list-disc">
                                  <li>
                                    <span className="font-bold">
                                      {t("draw")}:{" "}
                                    </span>
                                    <span>
                                      {t("allowed-signature-types-help.l1")}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="font-bold">Type: </span>
                                    <span>
                                      {t("allowed-signature-types-help.l2")}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="font-bold">
                                      {t("upload")}:{" "}
                                    </span>
                                    <span>
                                      {t("allowed-signature-types-help.l3")}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="font-bold">Default: </span>
                                    <span>
                                      {t("allowed-signature-types-help.l4")}
                                    </span>
                                  </li>
                                </ol>
                              </div>
                            </div>
                          </ReactTooltip>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 1.5,
                            mb: 1
                          }}
                        >
                          {signatureType.map((type, i) => (
                            <FormControlLabel
                              key={i}
                              sx={{ m: 0, textTransform: "capitalize" }}
                              control={
                                <Checkbox
                                  size="small"
                                  id={`signature-type-${type.name}`}
                                  name="signaturetype"
                                  onChange={() => handleCheckboxChange(i)}
                                  checked={type.enabled}
                                />
                              }
                              title={`Enabling this allows signers to ${type.name} signature`}
                              label={
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    "&:hover": { textDecoration: "underline" }
                                  }}
                                >
                                  {type?.name === "typed" ? "type" : type?.name}
                                </Typography>
                              }
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Notify on Signatures Section */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          component="label"
                          sx={{ fontSize: "14px", mb: "0.7rem", fontWeight: 500 }}
                        >
                          {t("notify-on-signatures")}
                          <a data-tooltip-id="nos-tooltip" className="ml-1">
                            <sup>
                              <HelpIcon />
                            </sup>
                          </a>
                          <ReactTooltip id="nos-tooltip" className="z-[999]">
                            <div className="max-w-[200px] md:max-w-[450px]">
                              <p className="font-bold">
                                {t("notify-on-signatures")}
                              </p>
                              <p>{t("notify-on-signatures-help.p1")}</p>
                              <p>{t("notify-on-signatures-help.note")}</p>
                            </div>
                          </ReactTooltip>
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Radio
                                id="notify-yes"
                                size="small"
                                onChange={() => handleNotifySignChange(true)}
                                checked={isNotifyOnSignatures === true}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: "0.875rem" }}>
                                {t("yes")}
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Radio
                                id="notify-no"
                                size="small"
                                onChange={() => handleNotifySignChange(false)}
                                checked={isNotifyOnSignatures === false}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: "0.875rem" }}>
                                {t("no")}
                              </Typography>
                            }
                          />
                        </Box>
                      </Box>

                      {/* Send in Order Section */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          component="label"
                          sx={{ fontSize: "14px", mb: "0.7rem", fontWeight: 500 }}
                        >
                          {t("send-in-order")}
                          <a
                            data-tooltip-id="sendInOrder-tooltip"
                            className="ml-1"
                          >
                            <sup>
                              <HelpIcon />
                            </sup>
                          </a>
                          <ReactTooltip
                            id="sendInOrder-tooltip"
                            className="z-[999]"
                          >
                            <div className="max-w-[200px] md:max-w-[450px]">
                              <p className="font-bold">{t("send-in-order")}</p>
                              <p>{t("send-in-order-help.p1")}</p>
                              <div className="p-[5px]">
                                <ol className="list-disc">
                                  <li>
                                    <span className="font-bold">
                                      {t("yes")}:{" "}
                                    </span>
                                    <span>{t("send-in-order-help.p2")}</span>
                                  </li>
                                  <li>
                                    <span className="font-bold">
                                      {t("no")}:{" "}
                                    </span>
                                    <span>{t("send-in-order-help.p3")}</span>
                                  </li>
                                </ol>
                              </div>
                              <p>{t("send-in-order-help.p4")}</p>
                            </div>
                          </ReactTooltip>
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Radio
                                id="order-yes"
                                size="small"
                                value={true}
                                name="SendinOrder"
                                checked={sendinOrder}
                                onChange={handleSendinOrderInput}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: "0.875rem" }}>
                                {t("yes")}
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Radio
                                id="order-no"
                                size="small"
                                value={false}
                                name="SendinOrder"
                                checked={!sendinOrder}
                                onChange={handleSendinOrderInput}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: "0.875rem" }}>
                                {t("no")}
                              </Typography>
                            }
                          />
                        </Box>
                      </Box>


                      <Box sx={{ mb: 3 }}>
                        <Typography
                          component="label"
                          htmlFor="sender-name-toggle"
                          sx={{ fontSize: "14px", mb: "0.7rem", fontWeight: 500 }}
                        >
                          {t("use-name-as-sender")}
                        </Typography>
                        <a
                          data-tooltip-id="sender-name-toggle-tooltip"
                          className="ml-1"
                        >
                          <sup>
                            <HelpIcon />
                          </sup>
                        </a>
                        <ReactTooltip
                          id="sender-name-toggle-tooltip"
                          className="z-[999]"
                        >
                          <div className="max-w-[200px] md:max-w-[450px] text-[13px] font-medium">
                            <p>
                              {t("use-name-as-sender-help", {
                                appName: appName
                              })}
                            </p>
                          </div>
                        </ReactTooltip>
                        <Box sx={{ ml: 1 }}>
                          <Switch
                            id="sender-name-toggle"
                            checked={useNameAsSender}
                            onChange={() =>
                              setUseNameAsSender((prevValue) => !prevValue)
                            }
                          />
                        </Box>
                      </Box>

                      {/* Enable Tour Section */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          component="label"
                          sx={{ fontSize: "14px", mb: "0.7rem", fontWeight: 500 }}
                        >
                          {t("enable-tour")}
                          <a
                            data-tooltip-id="istourenabled-tooltip"
                            className="ml-1"
                          >
                            <sup>
                              <HelpIcon />
                            </sup>
                          </a>
                          <ReactTooltip
                            id="istourenabled-tooltip"
                            className="z-[999]"
                          >
                            <div className="max-w-[200px] md:max-w-[450px]">
                              <p className="font-bold">{t("enable-tour")}</p>
                              <div className="p-[5px]">
                                <ol className="list-disc">
                                  <li>
                                    <span className="font-bold">
                                      {t("yes")}:{" "}
                                    </span>
                                    <span>{t("istourenabled-help.p1")}</span>
                                  </li>
                                  <li>
                                    <span className="font-bold">
                                      {t("no")}:{" "}
                                    </span>
                                    <span>{t("istourenabled-help.p2")}</span>
                                  </li>
                                </ol>
                              </div>
                              <p>
                                {t("istourenabled-help.p3", {
                                  appName: appName
                                })}
                              </p>
                            </div>
                          </ReactTooltip>
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Radio
                                id="tour-yes"
                                size="small"
                                value={true}
                                name="IsTourEnabled"
                                checked={isTourEnabled}
                                onChange={handleTourInput}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: "0.875rem" }}>
                                {t("yes")}
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Radio
                                id="tour-no"
                                size="small"
                                value={false}
                                name="IsTourEnabled"
                                checked={!isTourEnabled}
                                onChange={handleTourInput}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: "0.875rem" }}>
                                {t("no")}
                              </Typography>
                            }
                          />
                        </Box>
                      </Box>
                    </Box>
                    {/* Right Column - Timezone & Date Settings */}
                    <Box
                      sx={{
                        gridColumn: { md: "span 7" },
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <TimezoneSelector
                          timezone={timezone}
                          setTimezone={setTimezone}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <DateFormatSelector
                          timezone={timezone}
                          dateFormat={dateFormat}
                          is12HourTime={is12HourTime}
                          setIs12HourTime={setIs12HourTime}
                          setDateFormat={setDateFormat}
                        />
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <FilenameFormatSelector
                          fileNameFormat={fileNameFormat}
                          setFileNameFormat={setFileNameFormat}
                        />
                      </Box>
                    </Box>
                    {/* Save Button - Full Width */}
                    <Box
                      sx={{
                        gridColumn: { md: "span 12" },
                        display: "flex",
                        justifyContent: "flex-start",
                        mt: 1
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{ width: 110 }}
                        onClick={handleSave}
                      >
                        {t("save")}
                      </Button>
                    </Box>
                  </Box>
                )}
                {tabName(activeTab) === "widgets" && <WidgetsTab />}
                {tabName(activeTab) === "email" && <EmailTab />}
              </Box>
            </Box>
          )}
        </>
      )}
    </React.Fragment>
  );
};
export default Preferences;
