import i18next from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

function SelectLanguage(props) {
  const { i18n } = useTranslation();
  const languages = [
    { value: "en", text: "English" }, //english
    { value: "es", text: "Española" }, //spanish
    { value: "fr", text: "Français" }, //french
    { value: "it", text: "Italiano" }, //italian
    { value: "de", text: "Deutsch" }, //german
    { value: "hi", text: "हिन्दी" }, //hindi
    { value: "kr", text: "한국어" } //korean
  ];
  const defaultLanguage = i18next.language || "en";
  const [lang, setLang] = useState(defaultLanguage);
  // This function put query that helps to change the language
  const handleChangeLang = (e) => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
    props?.updateExtUser && props.updateExtUser({ language: e.target.value });
  };
  return (
    <Box
      sx={{
        ...(!props.isProfile && { mt: "9px", pb: { xs: 1, md: 0 } }),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "text.primary"
      }}
    >
      <TextField
        select
        size="small"
        value={lang}
        onChange={handleChangeLang}
        sx={{
          width: !props.isProfile ? { xs: "50%", md: "15%" } : "180px"
        }}
      >
        {languages.map((item) => {
          return (
            <MenuItem key={item.value} value={item.value}>
              {item.text}
            </MenuItem>
          );
        })}
      </TextField>
    </Box>
  );
}

export default SelectLanguage;
