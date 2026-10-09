import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { sessionStatus } from "../redux/reducers/userReducer";
import Parse from "parse";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ModalUi from "./ModalUi";

const SessionExpiredModal = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginBtn = async () => {
    try {
      await Parse?.User?.logOut();
    } catch (err) {
      console.log(`err: ${err}`);
    } finally {
      localStorage.removeItem("accesstoken");
      dispatch(sessionStatus(true));
      navigate("/", { replace: true, state: { from: location } });
    }
  };

  return (
    <ModalUi showHeader={false} isOpen={true} showClose={false}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: { xs: 2, md: 2.5 },
          px: 3,
          gap: 2.5
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {t("session-expired")}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLoginBtn}>
          {t("login")}
        </Button>
      </Box>
    </ModalUi>
  );
};

export default SessionExpiredModal;
