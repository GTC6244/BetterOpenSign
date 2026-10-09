import Box from "@mui/material/Box";
import { useGuidelinesContext } from "../../context/GuidelinesContext";

const Guidelines = ({ pageNumber }) => {
  const { guideRefs } = useGuidelinesContext();

  const horizontalSx = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1000,
    left: 0,
    width: "100%",
    borderTop: "1px dashed",
    borderColor: "primary.main"
  };
  const verticalSx = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1000,
    top: 0,
    height: "100%",
    borderLeft: "1px dashed",
    borderColor: "primary.main"
  };

  return (
    <>
      {/* Horizontal guidelines */}
      {/* top guide */}
      <Box
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].top = el;
        }}
        sx={horizontalSx}
        style={{ top: 0, display: "none" }}
      />
      {/* bottom guide */}
      <Box
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].bottom = el;
        }}
        sx={horizontalSx}
        style={{ top: 0, display: "none" }}
      />
      {/* Vertical guidelines */}
      {/* left guide */}
      <Box
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].left = el;
        }}
        sx={verticalSx}
        style={{ left: 0, display: "none" }}
      />
      {/* right guide */}
      <Box
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].right = el;
        }}
        sx={verticalSx}
        style={{ left: 0, display: "none" }}
      />
    </>
  );
};

export default Guidelines;
