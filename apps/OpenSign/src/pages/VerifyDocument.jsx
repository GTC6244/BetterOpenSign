import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PDFDocument, PDFName, PDFSignature, PDFRef, PDFDict } from "pdf-lib"; // Updated import
import * as asn1js from "asn1js";
import {
  Certificate,
  ContentInfo,
  SignedData,
  IssuerAndSerialNumber
} from "pkijs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const VerifyDocument = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBuffer, setFileBuffer] = useState(null);
  const [verificationResult, setVerificationResult] = useState("");
  const [detailedResults, setDetailedResults] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  // const [jsrsasignStatus, setJsrsasignStatus] = useState('loading'); // Removed

  // OID to human-readable label mapping
  const oidMapping = {
    "2.5.4.6": "Country",
    "2.5.4.10": "Organization",
    "2.5.4.11": "Organizational Unit",
    "2.5.4.17": "Postal Code",
    "2.5.4.8": "State",
    "2.5.4.7": "Locality", // Alternative for City
    "2.5.4.9": "City",
    "2.5.4.51": "Address",
    "2.5.4.3": "Common Name",
    "2.5.4.4": "Surname",
    "2.5.4.5": "Serial Number",
    "2.5.4.12": "Title",
    "2.5.4.13": "Description",
    "2.5.4.16": "Postal Address",
    "2.5.4.18": "Post Office Box",
    "2.5.4.20": "Telephone Number",
    "1.2.840.113549.1.9.1": "Email Address",
    // Common alternative OIDs
    C: "Country",
    O: "Organization",
    OU: "Organizational Unit",
    CN: "Common Name",
    ST: "State",
    L: "Locality",
    STREET: "Address",
    emailAddress: "Email Address",
    serialNumber: "Serial Number"
  };

  // Function to parse certificate subject/issuer into structured data
  const parseCertificateInfo = (certString) => {
    if (!certString) return {};

    const parsed = {};

    // Find all OID patterns and their positions
    const oidPattern = /(\d+\.\d+\.\d+\.\d+|\w+)=/g;
    const matches = [];
    let match;

    while ((match = oidPattern.exec(certString)) !== null) {
      matches.push({
        oid: match[1],
        startIndex: match.index,
        equalIndex: match.index + match[1].length
      });
    }

    // Extract value for each OID
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      const valueStart = currentMatch.equalIndex + 1; // Skip the "=" character
      const valueEnd = nextMatch ? nextMatch.startIndex - 2 : certString.length; // -2 to remove ", " before next OID

      const value = certString.substring(valueStart, valueEnd).trim();
      const label = oidMapping[currentMatch.oid] || currentMatch.oid;

      parsed[label] = value;
    }

    return parsed;
  };

  // Function to determine if status should show success icon
  const isSuccessStatus = (status) => {
    const successTerms = ["valid", "success", "parsed", "verified"];
    const errorTerms = ["error", "invalid", "failed", "expired"];

    const statusLower = status.toLowerCase();

    // Check for explicit error terms first
    if (errorTerms.some((term) => statusLower.includes(term))) {
      return false;
    }

    // Check for success terms
    return successTerms.some((term) => statusLower.includes(term));
  };

  // Function to determine if certificate validity should show success icon
  const isCertificateValid = (validityText) => {
    const validityLower = validityText.toLowerCase();

    // If it contains "valid" and doesn't contain negative terms
    return (
      validityLower.includes("valid") &&
      !validityLower.includes("expired") &&
      !validityLower.includes("not yet valid") &&
      !validityLower.includes("invalid")
    );
  };

  // Toggle collapsible sections
  const toggleSection = (signatureIndex, section) => {
    const key = `${signatureIndex}-${section}`;
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setVerificationResult("");
      setDetailedResults([]);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileBuffer(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setSelectedFile(null);
      setFileBuffer(null);
      setDetailedResults([]);
      setVerificationResult(t("please-select-pdf"));
    }
  };

  const parseSignature = async (pdfDoc) => {
    const signatureFields = pdfDoc
      .getForm()
      .getFields()
      .filter((field) => field instanceof PDFSignature); // Updated filter logic
    if (!signatureFields.length) {
      return { error: t("no-signature-found") };
    }

    const results = [];

    for (const field of signatureFields) {
      try {
        if (!field.acroField || !field.acroField.dict) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-acrofield-dict"),
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        // New logic to determine the actual signature dictionary
        const fieldDict = field.acroField.dict;
        const vEntry = fieldDict.get(PDFName.of("V"));
        let actualSignatureDict = null;

        if (vEntry) {
          if (vEntry instanceof PDFRef) {
            const lookedUp = pdfDoc.context.lookup(vEntry);
            if (lookedUp instanceof PDFDict) {
              actualSignatureDict = lookedUp;
            }
          } else if (vEntry instanceof PDFDict) {
            actualSignatureDict = vEntry;
          }
        }

        // Use actualSignatureDict if found, otherwise behavior might be problematic (as per existing logic)
        // If actualSignatureDict is null, subsequent checks for byteRangeObject etc. will fail,
        // leading to an error message for this signature, which is acceptable.
        const signatureDict = actualSignatureDict;

        // Check if signatureDict is null (meaning actualSignatureDict was not resolved)
        // and push an error if it is, before trying to get ByteRange or Contents.
        if (!signatureDict) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("signature-dictionary-not-found-or-invalid"), // New error message
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        const byteRangeObject = signatureDict.get(PDFName.of("ByteRange"));
        let byteRange; // Will be assigned after validation

        // Comprehensive validation for byteRangeObject and its contents
        if (
          !byteRangeObject ||
          !byteRangeObject.array ||
          !Array.isArray(byteRangeObject.array) ||
          byteRangeObject.array.length === 0 ||
          byteRangeObject.array.length % 2 !== 0
        ) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"),
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        const byteRangeNumbers = [];
        let byteRangeIsValid = true;
        for (const pdfObject of byteRangeObject.array) {
          if (!pdfObject || typeof pdfObject.asNumber !== "function") {
            byteRangeIsValid = false;
            break;
          }
          const num = pdfObject.asNumber();
          if (!Number.isFinite(num)) {
            // Checks for NaN, Infinity, -Infinity
            byteRangeIsValid = false;
            break;
          }
          byteRangeNumbers.push(num);
        }

        if (!byteRangeIsValid) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"), // Or a more specific error like "ByteRange contains non-numeric values"
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }
        byteRange = byteRangeNumbers; // Assign the validated numbers to byteRange

        const contentsObject = signatureDict.get(PDFName.of("Contents"));
        if (!contentsObject || typeof contentsObject.asString !== "function") {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-contents"),
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }
        const contents = contentsObject.asString();

        // The old basic check can be removed now as the more specific checks above cover these cases.
        // if (!byteRange || !contents) { ... }

        // Calculate totalSignedLength for accurate buffer initialization
        let totalSignedLength = 0;
        for (let i = 1; i < byteRange.length; i += 2) {
          totalSignedLength += byteRange[i];
        }

        if (totalSignedLength <= 0) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"), // totalSignedLength being non-positive implies invalid ByteRange
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }
        const pdfSignedDataBytes = new Uint8Array(totalSignedLength);
        let offset = 0;
        let reconstructionFailed = false;

        for (let i = 0; i < byteRange.length; i += 2) {
          const start = byteRange[i];
          const length = byteRange[i + 1];

          if (
            start < 0 ||
            length <= 0 ||
            start + length > fileBuffer.byteLength
          ) {
            reconstructionFailed = true;
            break;
          }
          pdfSignedDataBytes.set(
            new Uint8Array(fileBuffer.slice(start, start + length)),
            offset
          );
          offset += length;
        }

        if (reconstructionFailed) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"), // Error during reconstruction due to invalid segment
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        // Remove leading/trailing null bytes from hex if present from PDF content
        const pkcs7Hex = contents.trim();

        if (!pkcs7Hex) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: t("missing-signature-contents"), // New i18n key
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        // Convert hex string to ArrayBuffer
        let cmsContentBuffer;
        try {
          cmsContentBuffer = new Uint8Array(
            pkcs7Hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
          ).buffer;
        } catch (hexError) {
          // console.error('Error converting hex string to ArrayBuffer:', hexError); // Removed
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: t("invalid-signature-hex-format"), // New i18n key
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        // Parse the CMS ContentInfo
        const asn1 = asn1js.fromBER(cmsContentBuffer);
        if (asn1.offset === -1) {
          // console.error('Error parsing ASN.1 from signature data'); // Removed
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: "ASN.1 parsing error from signature data.",
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        const cmsContentInfo = new ContentInfo({ schema: asn1.result });
        if (
          String(cmsContentInfo.contentType).trim() !==
          String(ContentInfo.SIGNED_DATA).trim()
        ) {
          // console.error('Not a SignedData content type. Actual type:', cmsContentInfo.contentType, 'Expected:', ContentInfo.SIGNED_DATA); // Removed
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: t("unsupported-signature-format-not-signeddata"), // New i18n key
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        const signedData = new SignedData({ schema: cmsContentInfo.content });

        let signerInfoText = t("signer-info-not-available");
        let certSubject = "";
        let certIssuer = "";
        let certValidity = t("cert-validity-not-checked");
        let isValid = false;

        if (signedData.signerInfos && signedData.signerInfos.length > 0) {
          const signerInfo = signedData.signerInfos[0];

          if (signedData.certificates && signedData.certificates.length > 0) {
            let signerCertificate = null;
            for (const cert of signedData.certificates) {
              if (cert instanceof Certificate) {
                const issuerAndSerialNumber = signerInfo.sid;
                if (issuerAndSerialNumber instanceof IssuerAndSerialNumber) {
                  let certMatch = true;
                  if (
                    cert.issuer.typesAndValues.length ===
                    issuerAndSerialNumber.issuer.typesAndValues.length
                  ) {
                    for (
                      let i = 0;
                      i < cert.issuer.typesAndValues.length;
                      i++
                    ) {
                      if (
                        cert.issuer.typesAndValues[i].type !==
                          issuerAndSerialNumber.issuer.typesAndValues[i].type ||
                        cert.issuer.typesAndValues[i].value.valueBlock.value !==
                          issuerAndSerialNumber.issuer.typesAndValues[i].value
                            .valueBlock.value
                      ) {
                        certMatch = false;
                        break;
                      }
                    }
                  } else {
                    certMatch = false;
                  }

                  if (
                    certMatch &&
                    cert.serialNumber.valueBlock.valueHexView.join("") ===
                      issuerAndSerialNumber.serialNumber.valueBlock.valueHexView.join(
                        ""
                      )
                  ) {
                    signerCertificate = cert;
                    break;
                  }
                }
              }
            }

            if (signerCertificate) {
              certSubject = signerCertificate.subject.typesAndValues
                .map((tv) => `${tv.type}=${tv.value.valueBlock.value}`)
                .join(", ");
              certIssuer = signerCertificate.issuer.typesAndValues
                .map((tv) => `${tv.type}=${tv.value.valueBlock.value}`)
                .join(", ");
              signerInfoText = `${t("signer")}: ${certSubject}, ${t("issuer")}: ${certIssuer}`;

              const notBefore = signerCertificate.notBefore.value;
              const notAfter = signerCertificate.notAfter.value;
              const currentDate = new Date();
              certValidity = `${t("valid-from")} ${notBefore.toLocaleDateString()} ${t("to")} ${notAfter.toLocaleDateString()}`;
              if (currentDate < notBefore || currentDate > notAfter) {
                certValidity += ` (${t("expired-or-not-yet-valid")})`;
                isValid = false; // Explicitly false if expired
              } else {
                certValidity += ` (${t("valid")})`;
                isValid = true;
              }
            } else {
              signerInfoText = t("signer-certificate-not-found"); // New i18n key
            }
          } else {
            signerInfoText = t("no-certificates-in-signature"); // New i18n key
          }
        } else {
          signerInfoText = t("no-signer-info-in-pkcs7"); // Re-use existing key, or make new one
        }

        results.push({
          name: field.getName() || t("unnamed-signature-field"),
          status: isValid
            ? t("signature-valid-basic")
            : t("signature-invalid-basic"),
          signerInfo: signerInfoText,
          certificateSubject: certSubject,
          certificateIssuer: certIssuer,
          certificateValidity: certValidity,
          errorDetails:
            !isValid && signerInfoText === t("signer-info-not-available")
              ? t("could-not-parse-signer-info")
              : undefined // New i18n key
        });
      } catch (e) {
        console.error(
          "Error processing signature field with pkijs:",
          field.getName(),
          e
        );
        results.push({
          name: field.getName() || t("unnamed-signature-field"),
          status: t("error-processing-signature"),
          errorDetails: e.message,
          signerInfo: t("signer-info-not-available"),
          certificateSubject: "",
          certificateIssuer: "",
          certificateValidity: t("cert-validity-not-checked")
        });
      }
    }
    return { results };
  };

  const handleVerifyDocument = async () => {
    // Removed jsrsasignStatus check

    if (!fileBuffer) {
      setVerificationResult(t("please-select-file-to-verify"));
      setDetailedResults([]);
      return;
    }

    setVerificationResult(t("verification-in-progress"));
    setDetailedResults([]);

    try {
      // Removed window.KJUR and window.X509 check

      const pdfDoc = await PDFDocument.load(fileBuffer, {
        ignoreEncryption: true
      });
      const signatureInfo = await parseSignature(pdfDoc);

      if (signatureInfo.error) {
        setVerificationResult(signatureInfo.error);
      } else if (signatureInfo.results && signatureInfo.results.length > 0) {
        setDetailedResults(signatureInfo.results);
        // Overall status can be determined by checking if all signatures are valid
        const allValid = signatureInfo.results.every(
          (res) => res.status === t("signature-valid-basic")
        );
        setVerificationResult(
          allValid
            ? t("all-signatures-verified-convincing")
            : t("some-signatures-invalid-basic")
        );
      } else {
        setVerificationResult(t("no-signatures-processed")); // Should be caught by no-signature-found earlier
      }
    } catch (e) {
      console.error(
        "Error during PDF processing or signature verification:",
        e
      );
      setVerificationResult(`${t("error-verifying-pdf")}: ${e.message}`);
      setDetailedResults([]);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1152,
        mx: "auto",
        p: 3,
        mt: 5,
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: 3,
        borderRadius: 3
      }}
    >
      <style>{`
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #7ac142; /* Green color */
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff; /* White check path */
          stroke-miterlimit: 10;
          margin: 10px auto; /* Example margin */
          box-shadow: inset 0px 0px 0px #7ac142;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #7ac142;
          }
        }
      `}</style>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
      >
        {t("verify-document-signature")}
      </Typography>

      <Box
        sx={{
          mb: 3,
          p: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "surface.containerLow",
          boxShadow: 1
        }}
      >
        <Typography
          component="label"
          htmlFor="document-upload"
          sx={{ display: "block", fontSize: "1.125rem", fontWeight: 500, mb: 1 }}
        >
          {t("select-pdf-document")}
        </Typography>
        <Button
          variant="outlined"
          component="label"
          htmlFor="document-upload"
          sx={{ maxWidth: "20rem" }}
        >
          {t("select-pdf-document")}
          <input
            type="file"
            id="document-upload"
            accept=".pdf"
            onChange={handleFileChange}
            hidden
          />
        </Button>
        {selectedFile && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "0.875rem",
              width: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {t("selected-file")}: {selectedFile.name}
          </Typography>
        )}
      </Box>

      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleVerifyDocument}
          disabled={
            !selectedFile ||
            verificationResult === t("verification-in-progress")
          }
        >
          {/* Removed jsrsasignStatus === 'loading' condition for spinner */}
          {verificationResult === t("verification-in-progress") ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t("verify-signature")
          )}
        </Button>
      </Box>

      {verificationResult &&
        verificationResult !== t("verification-in-progress") && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "surface.container",
              boxShadow: 2,
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
            >
              {t("verification-status")}
            </Typography>
            {verificationResult ===
              "Document Verified: All signatures have been successfully validated." && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  my: 2
                }}
              >
                <svg
                  className="checkmark"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 52 52"
                >
                  <circle
                    className="checkmark__circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className="checkmark__check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </Box>
            )}
            <Typography
              sx={{ fontSize: "1.125rem", mb: 2, textAlign: "center" }}
            >
              {verificationResult}
            </Typography>
            {detailedResults.length > 0 && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3
                }}
              >
                {detailedResults.map((res, index) => {
                  const signerInfo = parseCertificateInfo(
                    res.certificateSubject
                  );
                  const issuerInfo = parseCertificateInfo(
                    res.certificateIssuer
                  );

                  return (
                    <Card key={index} sx={{ overflow: "hidden", boxShadow: 3 }}>
                      {/* Header Section */}
                      <Box
                        sx={{
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          p: 3
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                        >
                          <Box component="span" sx={{ fontSize: "1.5rem" }}>
                            🔏
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700 }}
                            >
                              Signature Details
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.875rem", opacity: 0.85 }}
                            >
                              Digital Certificate Information
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Basic Info Section */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: 1,
                          borderColor: "divider"
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 2
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: "text.secondary",
                                textTransform: "uppercase",
                                letterSpacing: "0.03em"
                              }}
                            >
                              Field Name
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: "1.125rem",
                                fontWeight: 600,
                                fontFamily: "monospace"
                              }}
                            >
                              {res.name}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: "text.secondary",
                                textTransform: "uppercase",
                                letterSpacing: "0.03em"
                              }}
                            >
                              Overall Status
                            </Typography>
                            <Box
                              sx={{
                                mt: 0.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  fontSize: "1.125rem",
                                  color: isSuccessStatus(res.status)
                                    ? "success.main"
                                    : "error.main"
                                }}
                              >
                                {isSuccessStatus(res.status) ? "✅" : "❌"}
                              </Box>
                              <Typography
                                sx={{ fontSize: "1.125rem", fontWeight: 600 }}
                              >
                                {res.status}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Signer Information Section */}
                      {Object.keys(signerInfo).length > 0 && (
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                          <Box
                            component="button"
                            onClick={() => toggleSection(index, "signer")}
                            sx={{
                              width: "100%",
                              px: 3,
                              py: 2,
                              textAlign: "left",
                              border: "none",
                              bgcolor: "transparent",
                              cursor: "pointer",
                              color: "inherit",
                              transition: "background-color 0.2s",
                              "&:hover": { bgcolor: "action.hover" }
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5
                                }}
                              >
                                <Box component="span" sx={{ fontSize: "1.25rem" }}>
                                  📇
                                </Box>
                                <Typography
                                  variant="h6"
                                  sx={{ fontSize: "1.125rem", fontWeight: 600 }}
                                >
                                  Signer Information
                                </Typography>
                              </Box>
                              <KeyboardArrowDownIcon
                                sx={{
                                  color: "text.secondary",
                                  transition: "transform 0.2s",
                                  transform: collapsedSections[`${index}-signer`]
                                    ? "rotate(180deg)"
                                    : "none"
                                }}
                              />
                            </Box>
                          </Box>
                          <Collapse
                            in={!collapsedSections[`${index}-signer`]}
                          >
                            <Box sx={{ px: 3, pb: 3 }}>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "1fr 1fr",
                                    lg: "1fr 1fr 1fr"
                                  },
                                  gap: 2
                                }}
                              >
                                {Object.entries(signerInfo).map(
                                  ([label, value]) => (
                                    <Box
                                      key={label}
                                      sx={{
                                        bgcolor: "surface.variant",
                                        borderRadius: 2,
                                        p: 2
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 500,
                                          color: "text.secondary",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.03em"
                                        }}
                                      >
                                        {label}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          mt: 0.5,
                                          fontSize: "0.875rem",
                                          fontFamily: "monospace",
                                          wordBreak: "break-all"
                                        }}
                                      >
                                        {value}
                                      </Typography>
                                    </Box>
                                  )
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      )}

                      {/* Issuer Information Section */}
                      {Object.keys(issuerInfo).length > 0 && (
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                          <Box
                            component="button"
                            onClick={() => toggleSection(index, "issuer")}
                            sx={{
                              width: "100%",
                              px: 3,
                              py: 2,
                              textAlign: "left",
                              border: "none",
                              bgcolor: "transparent",
                              cursor: "pointer",
                              color: "inherit",
                              transition: "background-color 0.2s",
                              "&:hover": { bgcolor: "action.hover" }
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5
                                }}
                              >
                                <Box component="span" sx={{ fontSize: "1.25rem" }}>
                                  🏢
                                </Box>
                                <Typography
                                  variant="h6"
                                  sx={{ fontSize: "1.125rem", fontWeight: 600 }}
                                >
                                  Issuer Details
                                </Typography>
                              </Box>
                              <KeyboardArrowDownIcon
                                sx={{
                                  color: "text.secondary",
                                  transition: "transform 0.2s",
                                  transform: collapsedSections[`${index}-issuer`]
                                    ? "rotate(180deg)"
                                    : "none"
                                }}
                              />
                            </Box>
                          </Box>
                          <Collapse
                            in={!collapsedSections[`${index}-issuer`]}
                          >
                            <Box sx={{ px: 3, pb: 3 }}>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "1fr 1fr",
                                    lg: "1fr 1fr 1fr"
                                  },
                                  gap: 2
                                }}
                              >
                                {Object.entries(issuerInfo).map(
                                  ([label, value]) => (
                                    <Box
                                      key={label}
                                      sx={{
                                        bgcolor: "surface.variant",
                                        borderRadius: 2,
                                        p: 2
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 500,
                                          color: "text.secondary",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.03em"
                                        }}
                                      >
                                        {label}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          mt: 0.5,
                                          fontSize: "0.875rem",
                                          fontFamily: "monospace",
                                          wordBreak: "break-all"
                                        }}
                                      >
                                        {value}
                                      </Typography>
                                    </Box>
                                  )
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      )}

                      {/* Certificate Validity Section */}
                      {res.certificateValidity && (
                        <Box sx={{ p: 3, bgcolor: "surface.containerLow" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              mb: 2
                            }}
                          >
                            <Box component="span" sx={{ fontSize: "1.25rem" }}>
                              🕒
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{ fontSize: "1.125rem", fontWeight: 600 }}
                            >
                              Certificate Validity
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              bgcolor: "background.paper",
                              borderRadius: 2,
                              p: 2,
                              border: 1,
                              borderColor: "divider"
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  fontSize: "1.125rem",
                                  color: isCertificateValid(
                                    res.certificateValidity
                                  )
                                    ? "success.main"
                                    : "error.main"
                                }}
                              >
                                {isCertificateValid(res.certificateValidity)
                                  ? "✅"
                                  : "❌"}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: "0.875rem",
                                  fontFamily: "monospace"
                                }}
                              >
                                {res.certificateValidity}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Technical Details Section (if any) */}
                      {(res.calculatedDocumentHash ||
                        res.messageDigestInSignature ||
                        res.hashComparisonResult ||
                        res.authenticatedAttributesSignatureResult ||
                        res.errorDetails ||
                        res.certificateSubject ||
                        res.certificateIssuer) && (
                        <Box
                          sx={{
                            p: 3,
                            bgcolor: "surface.containerLow",
                            borderTop: 1,
                            borderColor: "divider"
                          }}
                        >
                          <Box component="details" className="group">
                            <Box
                              component="summary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "text.secondary",
                                "&:hover": { color: "text.primary" }
                              }}
                            >
                              <Box component="span">🔧 Technical Details</Box>
                              <KeyboardArrowDownIcon
                                fontSize="small"
                                className="group-open:rotate-180"
                                sx={{ transition: "transform 0.2s" }}
                              />
                            </Box>
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5
                              }}
                            >
                              {/* Raw Certificate Data */}
                              {res.certificateSubject && (
                                <Box
                                  sx={{
                                    bgcolor: "background.paper",
                                    borderRadius: 1,
                                    p: 1.5,
                                    border: 1,
                                    borderColor: "divider"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 500,
                                      color: "text.secondary",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.03em",
                                      display: "block",
                                      mb: 0.5
                                    }}
                                  >
                                    Raw Certificate Subject
                                  </Typography>
                                  <Box
                                    component="code"
                                    sx={{
                                      fontSize: "0.75rem",
                                      wordBreak: "break-all",
                                      bgcolor: "surface.variant",
                                      p: 1,
                                      borderRadius: 1,
                                      display: "block"
                                    }}
                                  >
                                    {res.certificateSubject}
                                  </Box>
                                </Box>
                              )}
                              {res.certificateIssuer && (
                                <Box
                                  sx={{
                                    bgcolor: "background.paper",
                                    borderRadius: 1,
                                    p: 1.5,
                                    border: 1,
                                    borderColor: "divider"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 500,
                                      color: "text.secondary",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.03em",
                                      display: "block",
                                      mb: 0.5
                                    }}
                                  >
                                    Raw Certificate Issuer
                                  </Typography>
                                  <Box
                                    component="code"
                                    sx={{
                                      fontSize: "0.75rem",
                                      wordBreak: "break-all",
                                      bgcolor: "surface.variant",
                                      p: 1,
                                      borderRadius: 1,
                                      display: "block"
                                    }}
                                  >
                                    {res.certificateIssuer}
                                  </Box>
                                </Box>
                              )}
                              {res.calculatedDocumentHash &&
                                res.calculatedDocumentHash !==
                                  t("not-available") &&
                                res.calculatedDocumentHash !==
                                  t("not-calculated") && (
                                  <Box
                                    sx={{
                                      bgcolor: "background.paper",
                                      borderRadius: 1,
                                      p: 1.5,
                                      border: 1,
                                      borderColor: "divider"
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 500,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.03em",
                                        display: "block",
                                        mb: 0.5
                                      }}
                                    >
                                      Calculated Document Hash
                                    </Typography>
                                    <Box
                                      component="code"
                                      sx={{
                                        fontSize: "0.75rem",
                                        wordBreak: "break-all",
                                        bgcolor: "surface.variant",
                                        p: 1,
                                        borderRadius: 1,
                                        display: "block"
                                      }}
                                    >
                                      {res.calculatedDocumentHash}
                                    </Box>
                                  </Box>
                                )}
                              {res.messageDigestInSignature &&
                                res.messageDigestInSignature !==
                                  t("not-available") &&
                                res.messageDigestInSignature !==
                                  t("not-found-in-signature") && (
                                  <Box
                                    sx={{
                                      bgcolor: "background.paper",
                                      borderRadius: 1,
                                      p: 1.5,
                                      border: 1,
                                      borderColor: "divider"
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 500,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.03em",
                                        display: "block",
                                        mb: 0.5
                                      }}
                                    >
                                      Message Digest in Signature
                                    </Typography>
                                    <Box
                                      component="code"
                                      sx={{
                                        fontSize: "0.75rem",
                                        wordBreak: "break-all",
                                        bgcolor: "surface.variant",
                                        p: 1,
                                        borderRadius: 1,
                                        display: "block"
                                      }}
                                    >
                                      {res.messageDigestInSignature}
                                    </Box>
                                  </Box>
                                )}
                              {res.hashComparisonResult &&
                                res.hashComparisonResult !==
                                  t("not-performed") && (
                                  <Box
                                    sx={{
                                      bgcolor: "background.paper",
                                      borderRadius: 1,
                                      p: 1.5,
                                      border: 1,
                                      borderColor: "divider"
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 500,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.03em",
                                        display: "block",
                                        mb: 0.5
                                      }}
                                    >
                                      Hash Comparison
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.875rem" }}>
                                      {res.hashComparisonResult}
                                    </Typography>
                                  </Box>
                                )}
                              {res.authenticatedAttributesSignatureResult &&
                                res.authenticatedAttributesSignatureResult !==
                                  t("not-performed") && (
                                  <Box
                                    sx={{
                                      bgcolor: "background.paper",
                                      borderRadius: 1,
                                      p: 1.5,
                                      border: 1,
                                      borderColor: "divider"
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 500,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.03em",
                                        display: "block",
                                        mb: 0.5
                                      }}
                                    >
                                      Attributes Signature Verification
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.875rem" }}>
                                      {
                                        res.authenticatedAttributesSignatureResult
                                      }
                                    </Typography>
                                  </Box>
                                )}
                              {res.errorDetails && (
                                <Box
                                  sx={{
                                    bgcolor: "error.container",
                                    border: 1,
                                    borderColor: "error.main",
                                    borderRadius: 1,
                                    p: 1.5
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 500,
                                      color: "error.main",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.03em",
                                      display: "block",
                                      mb: 0.5
                                    }}
                                  >
                                    Error Details
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      color: "error.onContainer"
                                    }}
                                  >
                                    {res.errorDetails}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      {verificationResult === t("verification-in-progress") && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "surface.container",
            minHeight: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!verificationResult && !selectedFile && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "surface.container",
            minHeight: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              textAlign: "center"
            }}
          >
            {t("verification-results-will-appear-here")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VerifyDocument;
