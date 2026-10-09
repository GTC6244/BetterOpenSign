import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import login_img from "../assets/images/login_img.svg";
import Parse from "parse";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { useDispatch } from "react-redux";
import { fetchAppInfo } from "../redux/reducers/infoReducer";
import {
  emailRegex,
} from "../constant/const";
import { useTranslation } from "react-i18next";
import Loader from "../primitives/Loader";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

function ForgotPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState({ email: "", password: "", hideNav: "" });
  const [toast, setToast] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState();

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setState({ ...state, [name]: value });
  };

  const resize = () => {
    let currentHideNav = window.innerWidth <= 760;
    if (currentHideNav !== state.hideNav) {
      setState({ ...state, hideNav: currentHideNav });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!emailRegex.test(state.email)) {
      alert(t("valid-email-alert"));
    } else {
      setIsLoading(true);
      localStorage.setItem("appLogo", appInfo.applogo);
      localStorage.setItem("userSettings", JSON.stringify(appInfo.settings));
      if (state.email) {
        const username = state.email;
        try {
            await Parse.User.requestPasswordReset(username);
          setToast({ type: "success", message: t("reset-password-alert-1") });
        } catch (err) {
          console.log("err ", err.code);
          setToast({
            type: "danger",
            message: err.message || t("reset-password-alert-2")
          });
        } finally {
          setIsLoading(false);
          setTimeout(() => setToast({ type: "", message: "" }), 1000);
        }
      }
    }
  };

  useEffect(() => {
    dispatch(fetchAppInfo());
    saveLogo();
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line
  }, []);
  const saveLogo = async () => {
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("err while logging out ", err);
    }
      setImage(appInfo?.applogo || undefined);
  };
  return (
    <Box>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            zIndex: 50
          }}
        >
          <Loader />
        </Box>
      )}
      {toast?.message && <Alert type={toast.type}>{toast.message}</Alert>}
      <Box sx={{ p: { xs: 0, md: 5, lg: 8 } }}>
        <Card
          sx={{
            p: { xs: 2, md: 2, lg: 5 },
            bgcolor: "surface.main",
            color: "surface.onMain"
          }}
        >
          <Box
            sx={{
              width: 250,
              height: 66,
              display: "inline-block",
              overflow: "hidden"
            }}
          >
            {image && (
              <img
                src={image}
                style={{ objectFit: "contain", height: "100%" }}
                alt="applogo"
              />
            )}
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              columnGap: 1
            }}
          >
            <Box>
              <form onSubmit={handleSubmit}>
                <Typography component="h2" sx={{ fontSize: "30px", mt: 3 }}>
                  {t("welcome")}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: "12px", color: "text.secondary" }}
                >
                  {t("reset-password-alert-3")}
                </Typography>
                <Card sx={{ width: "100%", my: 2, boxShadow: 3 }}>
                  <Box sx={{ px: 3, py: 2 }}>
                    <Typography
                      component="label"
                      sx={{ display: "block", fontSize: "0.75rem" }}
                    >
                      {t("email")}
                    </Typography>
                    <TextField
                      type="email"
                      name="email"
                      fullWidth
                      value={state.email}
                      onChange={handleChange}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Card>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 1
                  }}
                >
                  <Button type="submit" variant="contained">
                    {t("submit")}
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/", { replace: true })}
                  >
                    {t("login")}
                  </Button>
                </Box>
              </form>
            </Box>
            {!state.hideNav && (
              <Box sx={{ alignSelf: "center" }}>
                <Box
                  sx={{
                    mx: "auto",
                    width: { md: "300px", lg: "500px" }
                  }}
                >
                  <img src={login_img} alt="bisec" width="100%" />
                </Box>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default ForgotPassword;
