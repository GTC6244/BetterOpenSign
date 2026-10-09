import { useEffect, useState } from "react";
import Parse from "parse";
import { appInfo } from "../constant/appinfo";
import { NavLink, useNavigate } from "react-router";
import {
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal,
  usertimezone
} from "../constant/Utils";
import { useDispatch } from "react-redux";
import { showTenant } from "../redux/reducers/ShowTenant";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { emailRegex } from "../constant/const";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const AddAdmin = () => {
  const appName =
    "OpenSign™";
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);
  const [isAuthorize, setIsAuthorize] = useState(false);
  const [isSubscribeNews, setIsSubscribeNews] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [state, setState] = useState({
    loading: false,
    alertType: "success",
    alertMsg: ""
  });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    checkUserExist();
    // eslint-disable-next-line
  }, []);
  const checkUserExist = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const app = await getAppLogo();
      if (app?.error === "invalid_json") {
        setErrMsg(t("server-down", { appName: appName }));
      } else if (app?.user === "exist") {
        setErrMsg(t("admin-exists"));
      }
    } catch (err) {
      setErrMsg(t("something-went-wrong-mssg"));
      console.log("err in check user exist", err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };
  const clearStorage = async () => {
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    }
    const baseUrl = localStorage.getItem("baseUrl");
    const appid = localStorage.getItem("parseAppId");
    const applogo = localStorage.getItem("appLogo");
    const defaultmenuid = localStorage.getItem("defaultmenuid");
    const PageLanding = localStorage.getItem("PageLanding");
    const userSettings = localStorage.getItem("userSettings");
    const favicon = localStorage.getItem("favicon");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", userSettings);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("favicon", favicon);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!emailRegex.test(email)) {
      alert(t("valid-email-alert"));
    } else {
      if (lengthValid && caseDigitValid && specialCharValid) {
        clearStorage();
        setState({ loading: true });
        const userDetails = {
          name: name,
          email: email?.toLowerCase()?.replace(/\s/g, ""),
          phone: phone,
          company: company,
          jobTitle: jobTitle
        };
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        try {
          event.preventDefault();
          const user = new Parse.User();
          user.set("name", name);
          user.set("email", email?.toLowerCase()?.replace(/\s/g, ""));
          user.set("password", password);
          user.set("phone", phone);
          user.set("username", email?.toLowerCase()?.replace(/\s/g, ""));
          const userRes = await user.save();
          if (userRes) {
            const params = {
              userDetails: {
                jobTitle: jobTitle,
                company: company,
                name: name,
                email: email?.toLowerCase()?.replace(/\s/g, ""),
                phone: phone,
                role: "contracts_Admin",
                timezone: usertimezone
              }
            };
            try {
              const usersignup = await Parse.Cloud.run("addadmin", params);
              if (usersignup) {
                if (isSubscribeNews) {
                  subscribeNewsletter();
                }
                handleNavigation(userRes.getSessionToken());
              }
            } catch (err) {
              alert(err.message);
              setState({ loading: false });
            }
          }
        } catch (error) {
          console.log("err ", error);
          if (error.code === 202) {
            const params = { email: email };
            const res = await Parse.Cloud.run("getUserDetails", params);
            // console.log("Res ", res);
            if (res) {
              alert(t("already-exists-this-username"));
              setState({ loading: false });
            } else {
              // console.log("state.email ", email);
              try {
                await Parse.User.requestPasswordReset(email).then(
                  async function (res) {
                    if (res.data === undefined) {
                      alert(t("verification-code-sent"));
                    }
                  }
                );
              } catch (err) {
                console.log(err);
              }
              setState({ loading: false });
            }
          } else {
            alert(error.message);
            setState({ loading: false });
          }
        }
      }
    }
  };
  const handleNavigation = async (sessionToken) => {
    const res = await Parse.User.become(sessionToken);
    if (res) {
      const _user = JSON.parse(JSON.stringify(res));
      // console.log("_user ", _user);
      localStorage.setItem("accesstoken", sessionToken);
      localStorage.setItem("UserInformation", JSON.stringify(_user));
      localStorage.setItem("accesstoken", _user.sessionToken);
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      // Check extended class user role and tenentId
      try {
        const userSettings = appInfo.settings;
        const extUser = await Parse.Cloud.run("getUserDetails");
        if (extUser) {
          const IsDisabled = extUser?.get("IsDisabled") || false;
          if (!IsDisabled) {
            const userRole = extUser?.get("UserRole");
            const menu =
              userRole && userSettings.find((menu) => menu.role === userRole);
            if (menu) {
              const _currentRole = userRole;
              const _role = _currentRole.replace("contracts_", "");
              localStorage.setItem("_user_role", _role);
              const extInfo_stringify = JSON.stringify([extUser]);
              localStorage.setItem("Extand_Class", extInfo_stringify);
              const extInfo = JSON.parse(JSON.stringify(extUser));
              localStorage.setItem("userEmail", extInfo?.Email);
              localStorage.setItem("username", extInfo?.Name);
              if (extInfo?.TenantId) {
                const tenant = {
                  Id: extInfo?.TenantId?.objectId || "",
                  Name: extInfo?.TenantId?.TenantName || ""
                };
                localStorage.setItem("TenantId", tenant?.Id);
                dispatch(showTenant(tenant?.Name));
                localStorage.setItem("TenantName", tenant?.Name);
              }
              localStorage.setItem("PageLanding", menu.pageId);
              localStorage.setItem("defaultmenuid", menu.menuId);
              localStorage.setItem("pageType", menu.pageType);
              setState({
                loading: false,
                alertType: "success",
                alertMsg: t("registered-user-successfully")
              });
              navigate(`/${menu.pageType}/${menu.pageId}`);
            } else {
              setState({
                loading: false,
                alertType: "danger",
                alertMsg: t("role-not-found")
              });
            }
          } else {
            setState({
              loading: false,
              alertType: "danger",
              alertMsg: t("do-not-access")
            });
          }
        }
      } catch (error) {
        console.log("error in fetch extuser", error);
        const msg = error.message || t("something-went-wrong-mssg");
        setState({ loading: false, alertType: "danger", alertMsg: msg });
      } finally {
        setTimeout(() => setState({ loading: false, alertMsg: "" }), 2000);
      }
    }
  };
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // Check conditions separately
    setLengthValid(newPassword.length >= 8);
    setCaseDigitValid(
      /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword)
    );
    setSpecialCharValid(/[!@#$%^&*()\-_=+{};:,<.>]/.test(newPassword));
  };
  const subscribeNewsletter = async () => {
    try {
      const params = { name: name, email: email, domain: window.location.host };
      await Parse.Cloud.run("newsletter", params);
      // console.log("newsletter ", newsletter);
    } catch (err) {
      console.log("err in subscribeNewsletter", err);
    }
  };
  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center" }}>
      {state.loading ? (
        <Box
          sx={{
            color: "text.secondary",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: { xs: "1.125rem", md: "1.5rem" }
          }}
        >
          <Loader />
        </Box>
      ) : (
        <>
          {errMsg ? (
            <Box
              sx={{
                color: "text.secondary",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: { xs: "1.125rem", md: "1.5rem" }
              }}
            >
              {errMsg}
            </Box>
          ) : (
            <Box sx={{ width: { xs: "95%", md: 500 } }}>
              <form onSubmit={handleSubmit}>
                <Paper
                  elevation={2}
                  sx={{
                    width: "100%",
                    my: 2,
                    borderRadius: 3,
                    border: 1,
                    borderColor: "divider"
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ textAlign: "center", mt: 1.5, fontWeight: 500 }}
                  >
                    {t("opensign-setup", { appName })}
                  </Typography>
                  <Box sx={{ textAlign: "center" }}>
                    <Link
                      component={NavLink}
                      to="https://discord.com/invite/xe9TDuyAyj"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: "0.875rem", mt: 0.5, cursor: "pointer" }}
                    >
                      {t("join-discord")}
                      <i
                        aria-hidden="true"
                        className="fa-brands fa-discord ml-1"
                      ></i>
                    </Link>
                  </Box>
                  <Box sx={{ px: 3, py: 1.5 }}>
                    <Typography
                      component="label"
                      variant="caption"
                      sx={{ display: "block" }}
                    >
                      {t("name")}{" "}
                      <Box component="span" sx={{ color: "error.main" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="text"
                      fullWidth
                      size="small"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                    <Box sx={{ my: 1 }} />
                    <Typography component="label" variant="caption">
                      {"email"}{" "}
                      <Box component="span" sx={{ color: "error.main" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      id="email"
                      type="email"
                      fullWidth
                      size="small"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value?.toLowerCase()?.replace(/\s/g, "")
                        )
                      }
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                    <Box sx={{ my: 1 }} />
                    <Typography component="label" variant="caption">
                      {t("phone")}{" "}
                      <Box component="span" sx={{ color: "error.main" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="tel"
                      fullWidth
                      size="small"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                    <Box sx={{ my: 1 }} />
                    <Typography component="label" variant="caption">
                      {t("company")}{" "}
                      <Box component="span" sx={{ color: "error.main" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="text"
                      fullWidth
                      size="small"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                    <Box sx={{ my: 1 }} />
                    <Typography component="label" variant="caption">
                      {t("job-title")}{" "}
                      <Box component="span" sx={{ color: "error.main" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="text"
                      fullWidth
                      size="small"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                    <Box sx={{ my: 1 }} />
                    <Typography component="label" variant="caption">
                      {t("password")}
                      <Box component="span" sx={{ color: "error.main" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type={showPassword ? "text" : "password"}
                      name="password"
                      fullWidth
                      size="small"
                      value={password}
                      onChange={(e) => handlePasswordChange(e)}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={togglePasswordVisibility}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? (
                                  <VisibilityOff fontSize="small" />
                                ) : (
                                  <Visibility fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                    {password.length > 0 && (
                      <Box sx={{ mt: 0.5, fontSize: "11px" }}>
                        <Typography
                          variant="caption"
                          component="p"
                          sx={{
                            color: lengthValid ? "success.main" : "error.main"
                          }}
                        >
                          {lengthValid ? "✓" : "✗"} {t("password-length")}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="p"
                          sx={{
                            color: caseDigitValid ? "success.main" : "error.main"
                          }}
                        >
                          {caseDigitValid ? "✓" : "✗"} {t("password-case")}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="p"
                          sx={{
                            color: specialCharValid
                              ? "success.main"
                              : "error.main"
                          }}
                        >
                          {specialCharValid ? "✓" : "✗"}{" "}
                          {t("password-special-char")}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        mt: 1.25,
                        ml: 0.5,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                      }}
                    >
                      <Checkbox
                        id="termsandcondition"
                        size="small"
                        checked={isAuthorize}
                        onChange={(e) => setIsAuthorize(e.target.checked)}
                        sx={{ p: 0 }}
                        slotProps={{
                          input: {
                            required: true,
                            onInvalid: (e) =>
                              e.target.setCustomValidity(t("input-required")),
                            onInput: (e) => e.target.setCustomValidity("")
                          }
                        }}
                      />
                      <Typography
                        component="label"
                        htmlFor="termsandcondition"
                        variant="caption"
                        sx={{ cursor: "pointer", ml: 0.5 }}
                      >
                        {t("agree")}
                      </Typography>
                      <Link
                        component="button"
                        type="button"
                        underline="always"
                        sx={{ ml: 0.5, cursor: "pointer" }}
                        onClick={() =>
                          openInNewTab(
                            "https://www.opensignlabs.com/terms-and-conditions"
                          )
                        }
                      >
                        {t("term")}
                      </Link>
                      <Box component="span">.</Box>
                    </Box>
                    <Box
                      sx={{
                        mt: 1.25,
                        ml: 0.5,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                      }}
                    >
                      <Checkbox
                        id="subscribetoopensign"
                        size="small"
                        checked={isSubscribeNews}
                        onChange={(e) => setIsSubscribeNews(e.target.checked)}
                        sx={{ p: 0 }}
                      />
                      <Typography
                        component="label"
                        htmlFor="subscribetoopensign"
                        variant="caption"
                        sx={{ cursor: "pointer", ml: 0.5 }}
                      >
                        {t("subscribe-to-opensign")}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mx: 2, textAlign: "center", mb: 1.5 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={state.loading}
                    >
                      {state.loading ? t("loading") : t("next")}
                    </Button>
                  </Box>
                </Paper>
              </form>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AddAdmin;
