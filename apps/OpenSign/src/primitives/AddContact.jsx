import { useState, useEffect } from "react";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getTenantDetails } from "../constant/Utils";
import { emailRegex } from "../constant/const";
import { useDispatch } from "react-redux";
import { sessionStatus } from "../redux/reducers/userReducer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const AddContact = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [addYourself, setAddYourself] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isUserExist, setIsUserExist] = useState(false);
  const [isOptionalDetails, setIsOptionalDetails] = useState(false);

  useEffect(() => {
    checkUserExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Load user details from localStorage when the component mounts
  useEffect(() => {
    const savedUserDetails = JSON.parse(
      localStorage.getItem("UserInformation")
    );
    if (savedUserDetails && addYourself) {
      setName(savedUserDetails.name);
      setPhone(savedUserDetails?.phone || "");
      setEmail(savedUserDetails.email);
      setJobTitle(savedUserDetails?.jobTitle || "");
      setCompany(savedUserDetails?.company || "");
    }
  }, [addYourself]);

  const checkUserExist = async () => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/isuserincontactbook`;
      const token =
            { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      };
      const axiosRes = await axios.post(url, {}, { headers });
      const contactRes = axiosRes?.data?.result || {};
      if (!contactRes?.objectId) {
        setIsUserExist(true);
      }
    } catch (err) {
      console.log("err ", err);
    }
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!emailRegex.test(email)) {
      alert(t("valid-email-alert"));
    } else {
      setIsLoader(true);
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const userId = user?.objectId || "";
      const tenantDetails = await getTenantDetails(
        userId,
      );
      const tenantId = tenantDetails?.objectId || "";
      if (tenantId) {
        try {
          const baseURL = localStorage.getItem("baseUrl");
          const url = `${baseURL}functions/savecontact`;
          const token =
                {
                  "X-Parse-Session-Token": localStorage.getItem("accesstoken")
                };
          const data = { name, email, phone, tenantId, jobTitle, company };
          const headers = {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            ...token
          };
          const axiosRes = await axios.post(url, data, { headers });
          const contactRes = axiosRes?.data?.result || {};
          if (contactRes?.objectId) {
            props.details(contactRes, props?.newContactId);
            if (props.closePopup) {
              props.closePopup();
              setIsLoader(false);
              // Reset the form fields
              handleReset();
            }
          }
        } catch (err) {
          console.log("Err", err);
          setIsLoader(false);
          if (err?.response?.data?.error?.includes("already exists")) {
            alert(t("add-signer-alert"));
          } else {
            alert(t("something-went-wrong-mssg"));
          }
        }
      } else {
        setIsLoader(false);
        dispatch(sessionStatus(false));
        alert(t("something-went-wrong-mssg"));
      }
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleAddYourselfChange = () => {
    if (addYourself) {
      handleReset();
    } else {
      setAddYourself(true);
    }
  };
  const handleReset = () => {
    setAddYourself(false);
    setName("");
    setPhone("");
    setEmail("");
    setJobTitle("");
    setCompany("");
  };

  return (
    <Box sx={{ height: "100%", px: 2.5, py: 1.25, color: "text.primary" }}>
      {isLoader && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.3)"
          }}
        >
          <Loader />
        </Box>
      )}
      <Box sx={{ width: "100%", mx: "auto", p: 1 }}>
        {!props?.isDisableTitle && (
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>
            {t("add-contact")}
          </Typography>
        )}
        {isUserExist && props?.isAddYourSelfCheckbox && (
          <FormControlLabel
            sx={{ mb: 1.5, mt: 0.5 }}
            control={
              <Checkbox
                size="small"
                id="addYourself"
                checked={addYourself}
                onChange={handleAddYourselfChange}
              />
            }
            label={t("add-yourself")}
          />
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            id="name"
            label={t("name")}
            required
            disabled={addYourself}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("enter-name")}
            slotProps={{
              htmlInput: {
                onInvalid: (e) =>
                  e.target.setCustomValidity(t("input-required")),
                onInput: (e) => e.target.setCustomValidity("")
              }
            }}
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth
            size="small"
            id="email"
            type="email"
            label={t("email")}
            required
            disabled={addYourself}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value?.toLowerCase()?.replace(/\s/g, ""))
            }
            placeholder={t("enter-email")}
            slotProps={{
              htmlInput: {
                onInvalid: (e) =>
                  e.target.setCustomValidity(t("input-required")),
                onInput: (e) => e.target.setCustomValidity(""),
                style: { textTransform: "lowercase" }
              }
            }}
            sx={{ mb: 1.5 }}
          />
          {isOptionalDetails && (
            <>
              <TextField
                fullWidth
                size="small"
                id="phone"
                label={t("phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phone-optional")}
                sx={{ mb: 1.5 }}
              />
              <TextField
                fullWidth
                size="small"
                id="company"
                label={t("company")}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t("phone-optional")}
                sx={{ mb: 1.5 }}
              />
              <TextField
                fullWidth
                size="small"
                id="jobTitle"
                label={t("job-title")}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={t("phone-optional")}
                sx={{ mb: 1.5 }}
              />
            </>
          )}
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={(e) => {
              e.preventDefault();
              setIsOptionalDetails(!isOptionalDetails);
            }}
            sx={{ color: "text.secondary" }}
          >
            {isOptionalDetails
              ? t("hide-optional-details")
              : t("optional-details")}
          </Link>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start", gap: 1 }}>
            <Button type="submit" variant="contained" color="primary">
              {t("submit")}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              onClick={() => handleReset()}
            >
              {t("reset")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddContact;
