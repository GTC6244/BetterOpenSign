import Box from "@mui/material/Box";
import { useGuidelinesContext } from "../../context/GuidelinesContext";

/**
 * Canvas-level guidelines that live inside the main scroll container (not
 * inside any individual page div). This allows the guideline lines to span
 * across page boundaries seamlessly when dragging a widget from the side
 * panel onto the document.
 */
const CanvasGuidelines = () => {
  const { canvasGuideRefs } = useGuidelinesContext();

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
          canvasGuideRefs.current.top = el;
        }}
        sx={horizontalSx}
        style={{ top: 0, display: "none" }}
      />
      {/* bottom guide */}
      <Box
        ref={(el) => {
          canvasGuideRefs.current.bottom = el;
        }}
        sx={horizontalSx}
        style={{ top: 0, display: "none" }}
      />
      {/* Vertical guidelines */}
      {/* left guide */}
      <Box
        ref={(el) => {
          canvasGuideRefs.current.left = el;
        }}
        sx={verticalSx}
        style={{ left: 0, display: "none" }}
      />
      {/* right guide */}
      <Box
        ref={(el) => {
          canvasGuideRefs.current.right = el;
        }}
        sx={verticalSx}
        style={{ left: 0, display: "none" }}
      />
    </>
  );
};

export default CanvasGuidelines;
