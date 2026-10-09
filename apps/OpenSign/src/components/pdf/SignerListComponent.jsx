import { darkenColor, getFirstLetter } from "../../constant/Utils";
import Box from "@mui/material/Box";

function SignerListComponent(props) {
  const checkSignerBackColor = (obj) => {
    if (obj) {
      let data = "";
      if (obj?.Id) {
        data = props.signerPos.filter((data) => data.Id === obj.Id);
      } else {
        data = props.signerPos.filter(
          (data) => data.signerObjId === obj.objectId
        );
      }
      return data && data.length > 0 && data[0].blockColor;
    }
  };
  const checkUserNameColor = (obj) => {
    const getBackColor = checkSignerBackColor(obj);
    if (getBackColor) {
      const color = darkenColor(getBackColor, 0.4);
      return color;
    } else {
      return "#abd1d0";
    }
  };

  return (
    <Box
      sx={{
        borderRadius: "12px",
        mx: 0.5,
        display: "flex",
        flexDirection: "row",
        flexGrow: 0,
        alignItems: "center",
        py: "10px",
        mt: 0.5,
        background: checkSignerBackColor(props.obj)
      }}
    >
      <Box
        sx={{
          background: checkUserNameColor(props.obj),
          display: "flex",
          flexShrink: 0,
          width: "30px",
          height: "30px",
          borderRadius: "9999px",
          justifyContent: "center",
          alignItems: "center",
          mx: 0.5
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: "12px",
            textAlign: "center",
            fontWeight: 700,
            color: "common.black",
            textTransform: "uppercase"
          }}
        >
          {getFirstLetter(
            props.obj?.Name || props.obj?.email || props.obj?.Role
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexGrow: 0,
          flexDirection: "column",
          overflow: "hidden",
          pr: 1
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {props.obj?.Name || props?.obj?.Role}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: "10px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {props.obj?.Email || props.obj?.email}
        </Box>
      </Box>
    </Box>
  );
}

export default SignerListComponent;
