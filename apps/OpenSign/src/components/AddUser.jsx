import { useEffect, useState } from "react";
import Parse from "parse";
import Loader from "../primitives/Loader";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import {
  copytoData,
  usertimezone
} from "../constant/Utils";
import {
  emailRegex,
} from "../constant/const";
import {
  useTranslation
} from "react-i18next";
import { withSessionValidation } from "../utils";

function generatePassword(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const AddUser = (props) => {
  const { t } = useTranslation();
  const [formdata, setFormdata] = useState({
    name: "",
    phone: "",
    email: "",
    team: "",
    password: "",
    role: ""
  });
  const [isFormLoader, setIsFormLoader] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const role = ["OrgAdmin", "Editor", "User"];
  useEffect(() => {
    getTeamList();
    // eslint-disable-next-line
  }, []);

  const getTeamList = async () => {
    setFormdata((prev) => ({ ...prev, password: generatePassword(12) }));
    const teamRes = await Parse.Cloud.run("getteams", { active: true });
    if (teamRes.length > 0) {
      const _teamRes = JSON.parse(JSON.stringify(teamRes));
      setTeamList(_teamRes);
        const allUserId =
          _teamRes.find((x) => x.Name === "All Users")?.objectId || "";
        setFormdata((prev) => ({ ...prev, team: allUserId }));
    }
  };
  const checkUserExist = async () => {
    try {
      const res = await Parse.Cloud.run("getUserDetails", {
        email: formdata.email
      });
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  // Define a function to handle form submission
  const handleSubmit = withSessionValidation(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!emailRegex.test(formdata.email)) {
      alert(t("valid-email-alert"));
    } else {
      const localUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      setIsFormLoader(true);
      const res = await checkUserExist();
      if (res) {
        props.showAlert("danger", t("user-already-exist"));
        setIsFormLoader(false);
      } else {
        if (localStorage.getItem("TenantId")) {
          const timezone = usertimezone;
          try {
            const params = {
              name: formdata.name,
              email: formdata.email,
              phone: formdata.phone,
              password: formdata.password,
              role: formdata.role,
              team: formdata.team,
              timezone: timezone,
              tenantId: localStorage.getItem("TenantId"),
              organization: {
                objectId: localUser?.OrganizationId?.objectId,
                company: localUser?.Company
              },
            };
            const res = await Parse.Cloud.run("adduser", params);
            const parseData = JSON.parse(JSON.stringify(res));
            if (props.closePopup) {
              props.closePopup();
            }
            if (props.handleUserData) {
              if (formdata?.team) {
                const team = teamList.find((x) => x.objectId === formdata.team);
                parseData.TeamIds = parseData.TeamIds.map((y) =>
                  y.objectId === team.objectId ? team : y
                );
              }
              props.handleUserData(parseData);
            }
            setIsFormLoader(false);
            setFormdata({
              name: "",
              email: "",
              phone: "",
              team: "",
              role: ""
            });
            props.showAlert("success", t("user-created-successfully"));
          } catch (err) {
            console.log("err", err);
            setIsFormLoader(false);
            props.showAlert("danger", t("something-went-wrong-mssg"));
          }
        } else {
          props.showAlert("danger", t("something-went-wrong-mssg"));
        }
      }
    }
  });

  // Define a function to handle the "add yourself" checkbox
  const handleReset = () => {
    setFormdata({ name: "", email: "", phone: "", team: "", role: "" });
    if (props.closePopup) {
      props.closePopup();
    }
  };
  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    props.showAlert("success", t("copied"));
  };
  const labelSx = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    mb: 0.5
  };
  const requiredMark = (
    <Box component="span" sx={{ color: "error.main", fontSize: "13px" }}>
      {" *"}
    </Box>
  );

  return (
    <Paper
      elevation={2}
      sx={{ borderRadius: 3, my: "1px", p: 1.5, position: "relative" }}
    >
      {isFormLoader && (
        <Box
          sx={{
            position: "absolute",
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
      <Box sx={{ width: "100%", mx: "auto" }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 1.5 }}>
            <Box component="label" htmlFor="name" sx={labelSx}>
              {t("name")}
              {requiredMark}
            </Box>
            <TextField
              type="text"
              name="name"
              value={formdata.name}
              onChange={(e) => handleChange(e)}
              required
              fullWidth
              size="small"
              placeholder={t("enter-name")}
              slotProps={{
                htmlInput: {
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity(""),
                  sx: { fontSize: "0.75rem" }
                }
              }}
            />
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Box component="label" htmlFor="email" sx={labelSx}>
              {t("email")}
              {requiredMark}
            </Box>
            <TextField
              type="email"
              name="email"
              value={formdata.email}
              onChange={(e) => handleChange(e)}
              required
              fullWidth
              size="small"
              placeholder={t("enter-email")}
              slotProps={{
                htmlInput: {
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity(""),
                  sx: { fontSize: "0.75rem" }
                }
              }}
            />
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Box component="label" sx={labelSx}>
              {t("password")}
            </Box>
            <TextField
              value={formdata?.password || ""}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                sx: { fontSize: "13px", wordBreak: "break-all" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => copytoclipboard(formdata?.password)}
                      aria-label="copy password"
                    >
                      <i className="fa-light fa-copy"></i>
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Typography
              sx={{
                fontSize: "12px",
                ml: 1,
                mb: 0,
                color: "error.main",
                userSelect: "none"
              }}
            >
              {t("password-generated")}
            </Typography>
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Box component="label" htmlFor="phone" sx={labelSx}>
              {t("phone")}
            </Box>
            <TextField
              type="text"
              name="phone"
              placeholder={t("phone-optional")}
              value={formdata.phone}
              onChange={(e) => handleChange(e)}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { sx: { fontSize: "0.75rem" } } }}
            />
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Box component="label" htmlFor="role" sx={labelSx}>
              {t("Role")}
              {requiredMark}
            </Box>
            <TextField
              select
              value={formdata.role}
              onChange={(e) => handleChange(e)}
              name="role"
              required
              fullWidth
              size="small"
              slotProps={{
                htmlInput: {
                  onInvalid: (e) =>
                    e.target.setCustomValidity(t("input-required")),
                  onInput: (e) => e.target.setCustomValidity("")
                }
              }}
              sx={{ "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
            >
              <MenuItem value={""}>{t("Select")}</MenuItem>
              {role.length > 0 &&
                role.map((x) => (
                  <MenuItem key={x} value={x}>
                    {x}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
            <Button type="submit" variant="contained">
              {t("submit")}
            </Button>
            <Button
              type="button"
              onClick={() => handleReset()}
              variant="contained"
              color="secondary"
            >
              {t("cancel")}
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default AddUser;
