import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalUi from "./ModalUi";
import {
  getSignedUrl,
  handleDownloadCertificate,
  handleDownloadPdf,
  fileNameWithUnderscore
} from "../constant/Utils";
import Loader from "./Loader";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

function DownloadPdfZip(props) {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const [selectType, setSelectType] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadType = [
    { id: 1, label: t("download-pdf") },
    { id: 2, label: t("pdf-certificate") }
  ];

  const handleDownload = async () => {
    if (selectType === 1) {
      await handleDownloadPdf(
        props.pdfDetails,
        setIsDownloading,
        props?.pdfBase64
      );
      setSelectType(1);
      props.setIsDownloadModal(false);
    } else if (selectType === 2) {
      setIsDownloading("pdf");
      const zip = new JSZip();
      const pdfDetails = props.pdfDetails;
      const pdfName =
        pdfDetails?.[0]?.Name?.length > 100
          ? pdfDetails?.[0]?.Name?.slice(0, 100)
          : pdfDetails?.[0]?.Name || "Document";
      const pdfUrl = pdfDetails?.[0]?.SignedUrl || "";

      try {
        // Fetch the first PDF (Signed Document)
        const docId = pdfDetails?.[0]?.objectId || "";
        const signedUrl = await getSignedUrl(
          pdfUrl,
          docId,
        );
        const pdf1Response = await fetch(signedUrl);
        if (!pdf1Response.ok) {
          throw new Error(`Failed to fetch PDF: ${signedUrl}`);
        }
        const pdf1Blob = await pdf1Response.blob();
        const isZip = true;
        // Fetch the Certificate (or generate its URL dynamically)
        const certificateUrl = await handleDownloadCertificate(
          pdfDetails,
          setIsDownloading,
          isZip
        );
        const pdf2Response = await fetch(certificateUrl);
        if (!pdf2Response.ok) {
          throw new Error(`Failed to fetch certificate PDF: ${certificateUrl}`);
        }
        const pdf2Blob = await pdf2Response.blob();
          // Add files to ZIP
          zip.file(
            `${fileNameWithUnderscore(pdfName)}_signed_by_${appName}.pdf`,
            pdf1Blob
          );
          zip.file(`Certificate_signed_by_${appName}.pdf`, pdf2Blob);
          // Generate the ZIP and trigger download
          const zipBlob = await zip.generateAsync({ type: "blob" });
          saveAs(
            zipBlob,
            `${fileNameWithUnderscore(pdfName)}_signed_by_${appName}.zip`
          );
        setSelectType(1);
        props.setIsDownloadModal(false);
        setIsDownloading("");
      } catch (error) {
        alert(t("something-went-wrong-mssg"));
        setSelectType(1);
        props.setIsDownloadModal(false);
        setIsDownloading("");
        console.log("Error creating ZIP file:", error);
      }
    }
  };
  return (
    <ModalUi
      isOpen={props.isDownloadModal}
      title={t("download-files")}
      handleClose={() => props.setIsDownloadModal(false)}
    >
      <Box sx={{ p: 2.5, height: "100%", color: "text.primary" }}>
        <RadioGroup
          value={selectType}
          onChange={(e) => setSelectType(Number(e.target.value))}
        >
          {downloadType.map((data, ind) => (
            <FormControlLabel
              key={ind}
              value={data.id}
              control={<Radio size="small" />}
              label={data.label}
            />
          ))}
        </RadioGroup>
        <Divider sx={{ my: "15px" }} />
        <Button
          onClick={() => handleDownload()}
          type="submit"
          variant="contained"
          color="primary"
        >
          {t("download")}
        </Button>
      </Box>
      {isDownloading === "pdf" && (
        <Box
          sx={{
            position: "fixed",
            zIndex: 200,
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
      <ModalUi
        isOpen={
          isDownloading === "certificate" || isDownloading === "certificate_err"
        }
        title={
          isDownloading === "certificate" || isDownloading === "certificate_err"
            ? t("generating-certificate")
            : t("pdf-download")
        }
        handleClose={() => setIsDownloading("")}
      >
        <Box
          sx={{
            p: { xs: 1.5, md: 2.5 },
            fontSize: { xs: "13px", md: "1rem" },
            textAlign: "center",
            color: "text.primary"
          }}
        >
          {isDownloading === "certificate" ? (
            <Typography>{t("generate-certificate-alert")}</Typography>
          ) : (
            <Typography>{t("generate-certificate-err")}</Typography>
          )}
        </Box>
      </ModalUi>
    </ModalUi>
  );
}

export default DownloadPdfZip;
