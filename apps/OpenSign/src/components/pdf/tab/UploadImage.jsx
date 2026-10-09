import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

function UploadImage(props) {
  const { t } = useTranslation();
  const imageRefs = useRef({});

  const getImageRef = (key) => {
    if (!imageRefs.current[key]) {
      imageRefs.current[key] = React.createRef();
    }
    return imageRefs.current[key];
  };

  return (
    <Box>
      {(props?.isImageSelect || props?.isStampOrImage) && !props?.image ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            className={
              props?.currWidgetsDetails?.type === "initials"
                ? "intialSignatureCanvas"
                : "signatureCanvas"
            }
            onClick={() =>
              getImageRef(props?.currWidgetsDetails?.key).current.click()
            }
            sx={{
              bgcolor: "common.white",
              border: "1.3px solid",
              borderColor: "outline.variant",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: "6px",
              cursor: "pointer"
            }}
          >
            <input
              type="file"
              onChange={props?.onImageChange}
              className="filetype"
              accept="image/png,image/jpeg"
              ref={getImageRef(props?.currWidgetsDetails?.key)}
              hidden
            />
            <Box
              component="i"
              className="fa-light fa-cloud-upload-alt uploadImgLogo"
              sx={{ color: "text.primary" }}
            />
            <Box sx={{ fontSize: "10px", color: "text.primary" }}>
              {t("upload")}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            className={
              props?.currWidgetsDetails?.type === "initials"
                ? "intialSignatureCanvas"
                : "signatureCanvas"
            }
            sx={{
              bgcolor: "common.white",
              border: "1.3px solid",
              borderColor: "outline.variant",
              mb: "6px",
              overflow: "hidden"
            }}
          >
            <img
              alt="print img"
              ref={getImageRef(props?.currWidgetsDetails?.key)}
              src={props?.image?.src}
              draggable="false"
              style={{ objectFit: "contain", height: "100%", width: "100%" }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default UploadImage;
