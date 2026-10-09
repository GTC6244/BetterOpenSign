import Box from "@mui/material/Box";

function DefaultSignature(props) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        className={
          props?.currWidgetsDetails?.type === "initials"
            ? "intialSignatureCanvas"
            : "signatureCanvas"
        }
        sx={{
          border: "1.3px solid",
          borderColor: "outline.variant",
          borderRadius: "4px"
        }}
      >
        <img
          src={props?.defaultSignImg}
          draggable="false"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
    </Box>
  );
}

export default DefaultSignature;
