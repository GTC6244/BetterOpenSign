import { useEffect, useState } from "react";
import Loader from "../primitives/Loader";
import Parse from "parse";
import { NavLink, useNavigate } from "react-router";
import Alert from "../primitives/Alert";
import { useTranslation } from "react-i18next";
import { emailRegex } from "../constant/const";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
const UpdateExistUserAdmin = () => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({ email: "", masterkey: "" });
  const [loader, setLoader] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "danger", msg: "" });
  useEffect(() => {
    checkIsAdminExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIsAdminExist = async () => {
    try {
      const isAdminExist = await Parse.Cloud.run("checkadminexist");
      if (isAdminExist !== "not_exist") {
        // console.log("isAdminExist ", isAdminExist);
        setErrMsg(t("admin-exists"));
      }
    } catch (err) {
      console.log("Err in checkadminexist", err);
      setErrMsg(t("something-went-wrong-mssg"));
    } finally {
      setLoader(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!emailRegex.test(formdata.email)) {
      alert(t("valid-email-alert"));
    } else {
      setIsSubmitLoading(true);
      try {
        const updateUserAsAdmin = await Parse.Cloud.run(
          "updateuserasadmin",
          formdata
        );
        // console.log("updateUserAsAdmin ", updateUserAsAdmin);
        if (updateUserAsAdmin === "admin_created") {
          setIsAlert({ type: "success", msg: t("admin-created") });
          navigate("/");
        }
      } catch (err) {
        console.log("err in updateuserasadmin", err.code);
        if (err.code === 404) {
          setIsAlert((prev) => ({ ...prev, msg: t("invalid-masterkey") }));
        } else if (err.code === 101) {
          setIsAlert((prev) => ({ ...prev, msg: t("user-not-found") }));
        } else if (err.code === 137) {
          setIsAlert((prev) => ({ ...prev, msg: t("admin-exists") }));
        } else {
          setErrMsg(t("something-went-wrong-mssg"));
        }
      } finally {
        setIsSubmitLoading(false);
        setTimeout(() => {
          setIsAlert(() => ({ type: "danger", msg: "" }));
        }, 2000);
      }
    }
  };
  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center" }}>
      {isAlert.msg && <Alert type={isAlert.type}>{isAlert.msg}</Alert>}
      {loader ? (
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
            <Box sx={{ width: { xs: "95%", md: "500px" } }}>
              <form onSubmit={handleSubmit}>
                <Card
                  sx={{
                    width: "100%",
                    my: 2,
                    boxShadow: 3,
                    overflow: "hidden",
                    position: "relative"
                  }}
                >
                  {isSubmitLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        zIndex: 40,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        bgcolor: "rgba(0,0,0,0.3)"
                      }}
                    >
                      <Loader />
                    </Box>
                  )}
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: "30px",
                      textAlign: "center",
                      mt: 1.5,
                      fontWeight: 500
                    }}
                  >
                    {t("opensign-setup", { appName })}
                  </Typography>
                  <Box sx={{ textAlign: "center" }}>
                    <Link
                      component={NavLink}
                      to="https://discord.com/invite/xe9TDuyAyj"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "inline-block",
                        fontSize: "0.875rem",
                        mt: 0.5,
                        cursor: "pointer"
                      }}
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
                      sx={{ fontSize: "0.75rem" }}
                    >
                      {t("email")}{" "}
                      <Box
                        component="span"
                        sx={{ color: "error.main", fontSize: "13px" }}
                      >
                        *
                      </Box>
                    </Typography>
                    <TextField
                      id="email"
                      type="email"
                      fullWidth
                      value={formdata.email}
                      onChange={(e) =>
                        setFormdata((prev) => ({
                          ...prev,
                          email: e.target.value
                            ?.toLowerCase()
                            ?.replace(/\s/g, "")
                        }))
                      }
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
                    <Box sx={{ my: 2 }} />
                    <Typography
                      component="label"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      {t("master-key")}{" "}
                      <Box
                        component="span"
                        sx={{ color: "error.main", fontSize: "13px" }}
                      >
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="text"
                      fullWidth
                      value={formdata.masterkey}
                      onChange={(e) =>
                        setFormdata((prev) => ({
                          ...prev,
                          masterkey: e.target.value
                        }))
                      }
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
                  <Box sx={{ mx: 2, textAlign: "center", mb: 1.5 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loader}
                    >
                      {loader ? t("loading") : t("next")}
                    </Button>
                  </Box>
                </Card>
              </form>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default UpdateExistUserAdmin;
