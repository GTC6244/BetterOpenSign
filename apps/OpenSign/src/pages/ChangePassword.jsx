import { useState } from "react";
import Parse from "parse";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function ChangePassword() {
  const { t } = useTranslation();
  const [currentpassword, setCurrentPassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);
  const [showNewPassword, setNewShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleNewPasswordVisibility = () => {
    setNewShowPassword(!showNewPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setconfirmpassword(newPassword);
    // Check conditions separately
    setLengthValid(newPassword.length >= 8);
    setCaseDigitValid(
      /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword)
    );
    setSpecialCharValid(/[!@#$%^&*()\-_=+{};:,<.>]/.test(newPassword));
  };
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (newpassword === confirmpassword) {
        if (lengthValid && caseDigitValid && specialCharValid) {
          Parse.User.logIn(localStorage.getItem("userEmail"), currentpassword)
            .then(async (user) => {
              if (user) {
                const User = new Parse.User();
                const query = new Parse.Query(User);
                await query.get(user.id).then((user) => {
                  // Updates the data we want
                  user.set("password", newpassword);
                  user
                    .save()
                    .then(async () => {
                      let _user = user.toJSON();
                      if (_user) {
                        await Parse.User.become(_user.sessionToken);
                        localStorage.setItem("accesstoken", _user.sessionToken);
                      }
                      setCurrentPassword("");
                      setnewpassword("");
                      setconfirmpassword("");
                      alert(t("password-update-alert-1"));
                    })
                    .catch((error) => {
                      console.log("err", error);
                      alert(t("something-went-wrong-mssg"));
                    });
                });
              } else {
                alert(t("password-update-alert-2"));
              }
            })
            .catch((error) => {
              alert(t("password-update-alert-3"));
              console.error("Error while logging in user", error);
            });
        }
      } else {
        alert(t("password-update-alert-4"));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  if (localStorage.getItem("accesstoken") === null) {
    return <Navigate to="/" />;
  }
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "surface.main",
        color: "surface.onMain",
        boxShadow: 1,
        borderRadius: 3,
        p: 1
      }}
    >
      <Typography
        sx={{
          fontSize: "1.25rem",
          fontWeight: 700,
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        {t("change-password")}
      </Typography>
      <Box sx={{ m: 1 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <TextField
            label={t("current-password")}
            type="password"
            name="currentpassword"
            value={currentpassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t("current-password")}
            fullWidth
            slotProps={{
              htmlInput: {
                required: true,
                onInvalid: (e) =>
                  e.target.setCustomValidity(t("input-required")),
                onInput: (e) => e.target.setCustomValidity("")
              }
            }}
          />
          <TextField
            label={t("new-password")}
            type={showNewPassword ? "text" : "password"}
            name="newpassword"
            value={newpassword}
            onChange={(e) => setnewpassword(e.target.value)}
            placeholder={t("new-password")}
            fullWidth
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
                      aria-label="toggle new password visibility"
                      onClick={toggleNewPasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? (
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
          <TextField
            label={t("confirm-password")}
            type={showConfirmPassword ? "text" : "password"}
            name="confirmpassword"
            value={confirmpassword}
            onChange={handlePasswordChange}
            placeholder={t("confirm-password")}
            fullWidth
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
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? (
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
          {confirmpassword.length > 0 && (
            <Box sx={{ mt: 0.5, fontSize: "11px" }}>
              {newpassword.length > 0 && (
                <Typography
                  sx={{
                    fontSize: "11px",
                    mt: 0.5,
                    color:
                      newpassword === confirmpassword
                        ? "success.main"
                        : "error.main"
                  }}
                >
                  {newpassword === confirmpassword ? "✓" : "✗"}{" "}
                  {t("password-match-length")}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: "11px",
                  color: lengthValid ? "success.main" : "error.main"
                }}
              >
                {lengthValid ? "✓" : "✗"} {t("password-length")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: caseDigitValid ? "success.main" : "error.main"
                }}
              >
                {caseDigitValid ? "✓" : "✗"} {t("password-case")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: specialCharValid ? "success.main" : "error.main"
                }}
              >
                {specialCharValid ? "✓" : "✗"} {t("password-special-char")}
              </Typography>
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={{ boxShadow: 2, mt: 1, alignSelf: "flex-start" }}
          >
            {t("change-password")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ChangePassword;
