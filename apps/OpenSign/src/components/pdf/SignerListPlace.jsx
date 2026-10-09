import RecipientList from "./RecipientList";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

function SignerListPlace(props) {
  const { t } = useTranslation();

  const handleAddRecipient = () => {
    props?.setIsAddSigner(true);
    props.setIsTour && props.setIsTour(false);
  };

  return (
    <Box>
      <Box
        sx={{
          mx: 1,
          pr: 1,
          pt: 1,
          pb: 0.5,
          fontSize: "15px",
          fontWeight: 600,
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Box component="span" sx={{ position: "relative" }}>
          {props.title ? props.title : "Recipients"}
          <Box
            component="sup"
            onClick={() => props.setIsTour && props.setIsTour(true)}
          >
            <Box
              component="i"
              className="fa-light fa-question"
              sx={{
                ml: 0.5,
                cursor: "pointer",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: "text.primary",
                fontSize: "11px",
                py: "1px",
                px: "3px"
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className="hide-scrollbar" sx={{ overflow: "auto", maxHeight: "180px" }}>
        <RecipientList {...props} />
      </Box>
      <Box sx={{ mx: 0.5 }}>
        {props.handleAddSigner ? (
          <Button
            data-tut="reactourAddbtn"
            disabled={props?.isMailSend ? true : false}
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: "14px" }}
            startIcon={<Box component="i" className="fa-light fa-plus" />}
            onClick={() => props.handleAddSigner()}
          >
            {t("add-role")}
          </Button>
        ) : (
          <Button
            data-tut="addRecipient"
            disabled={props?.isMailSend ? true : false}
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: "14px" }}
            startIcon={<Box component="i" className="fa-light fa-plus" />}
            onClick={handleAddRecipient}
          >
            {t("add-recipients")}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default SignerListPlace;
