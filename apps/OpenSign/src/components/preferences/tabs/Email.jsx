import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import MailTemplateEditor from "../MailTemplateEditor";

const EmailTab = () => {
  const { t } = useTranslation();
  const {
    tenantInfo
  } = useSelector((state) => state.user);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <MailTemplateEditor
          info={
                tenantInfo
          }
          tenantId={tenantInfo?.objectId}
        />
    </Box>
  );
};

export default EmailTab;
