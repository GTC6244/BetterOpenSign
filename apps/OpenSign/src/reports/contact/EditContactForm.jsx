import { useEffect, useState } from "react";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";
import Parse from "parse";
import { withSessionValidation } from "../../utils";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const EditContactForm = (props) => {
  const { t } = useTranslation();
  const [isLoader, setIsLoader] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Company: "",
    JobTitle: ""
  });
  useEffect(() => {
    if (props.contact?.Email) {
      setFormData((prev) => ({ ...prev, ...props.contact }));
    }
  }, [props.contact]);
  const handleChange = (e) => {
    if (e.target.name === "Email") {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value?.toLowerCase()?.replace(/\s/g, "")
      }));
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };
  const handleSubmit = withSessionValidation(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (props.handleEditContact) {
      try {
        setIsLoader(true);
        const params = {
          contactId: props.contact.objectId,
          name: formData.Name,
          email: formData.Email,
          phone: formData?.Phone,
          company: formData?.Company,
          jobTitle: formData?.JobTitle,
          tenantId: localStorage.getItem("TenantId")
        };
        const res = await Parse.Cloud.run("editcontact", params);
        const updateContact = {
          ...res,
          Name: formData.Name,
          Email: formData.Email,
          Phone: formData?.Phone,
          Company: formData?.Company,
          JobTitle: formData?.JobTitle
        };
        props.handleEditContact(updateContact);
      } catch (err) {
        console.log("err in edit contact ", err);
        if (err.code === 137) {
          alert(t("contact-already-exists"));
        } else {
          alert(t("something-went-wrong-mssg"));
        }
      } finally {
        setIsLoader(false);
        props.handleClose && props.handleClose();
      }
    }
  });
  return (
    <Box sx={{ height: "100%", p: "20px" }}>
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
      <Box sx={{ width: "100%", mx: "auto", p: 1, color: "text.primary" }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            type="text"
            id="name"
            name="Name"
            label={t("name")}
            required
            value={formData.Name}
            onChange={(e) => handleChange(e)}
            onInput={(e) => e.target.setCustomValidity("")}
            onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
            placeholder={t("enter-name")}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            type="email"
            id="email"
            name="Email"
            label={t("email")}
            required
            value={formData.Email}
            onChange={(e) => handleChange(e)}
            onInput={(e) => e.target.setCustomValidity("")}
            onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
            placeholder={t("enter-email")}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            type="text"
            id="phone"
            name="Phone"
            label={t("phone")}
            value={formData.Phone}
            onChange={(e) => handleChange(e)}
            placeholder={t("phone-optional")}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            type="text"
            id="Company"
            name="Company"
            label={t("company")}
            value={formData.Company}
            onChange={(e) => handleChange(e)}
            placeholder={t("phone-optional")}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            type="text"
            id="JobTitle"
            name="JobTitle"
            label={t("job-title")}
            value={formData.JobTitle}
            onChange={(e) => handleChange(e)}
            placeholder={t("phone-optional")}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-start" sx={{ mt: 2 }}>
            <Button type="submit" variant="contained">
              {t("submit")}
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default EditContactForm;
