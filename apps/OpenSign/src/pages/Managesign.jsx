import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../styles/managesign.css";
import "../styles/signature.css";
import {
  generateTitleFromFilename,
  getSecureUrl,
  toDataUrl
} from "../constant/Utils";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { sanitizeFileName, withSessionValidation } from "../utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const COLOR_CLASS = {
  blue: "text-blue-600",
  red: "text-red-600",
  black: "text-black",
  white: "text-white"
};

const ManageSign = () => {
  const { t } = useTranslation();
  const [penColor, setPenColor] = useState("blue");
  const [initialPen, setInitialPen] = useState("blue");
  const [image, setImage] = useState();
  const [signName, setSignName] = useState("");
  const [signature, setSignature] = useState("");
  const [warning, setWarning] = useState(false);
  const [isvalue, setIsValue] = useState(false);
  const allColor = ["blue", "red", "black"];
  const [isLoader, setIsLoader] = useState(true);
  const [isAlert, setIsAlert] = useState({ type: "success", message: "" });
  const [Initials, setInitials] = useState("");
  const [isInitials, setIsInitials] = useState(false);
  const [id, setId] = useState("");
  const [imgInitials, setImgInitials] = useState("");
  const [stamp, setStamp] = useState();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const initailsRef = useRef(null);
  const imgInitialsRef = useRef(null);
  const stampRef = useRef(null);
  useEffect(() => {
    fetchUserSign();
    // eslint-disable-next-line
  }, []);
  const fetchUserSign = async () => {
    const User = Parse.User.current();
    if (User) {
      const userId = {
        __type: "Pointer",
        className: "_User",
        objectId: User.id
      };
      try {
        const signRes = await Parse.Cloud.run("getdefaultsignature", {
          userId: User.id
        });
        if (signRes) {
          const res = signRes.toJSON();
          setId(res.objectId);
          if (res?.SignatureName) {
            const sanitizename = generateTitleFromFilename(res?.SignatureName);
            const replaceSpace = sanitizeFileName(sanitizename);
            setSignName(replaceSpace);
          }
          setImage(res?.ImageURL);
          if (res && res.Initials) {
            // setInitials(res.Initials);
            setIsInitials(true);
            setImgInitials(res?.Initials);
          }
          if (res && res?.Stamp) {
            setStamp(res?.Stamp);
          }
        } else {
          if (User?.get("name")) {
            const sanitizename = generateTitleFromFilename(User?.get("name"));
            const replaceSpace = sanitizeFileName(sanitizename);
            setSignName(replaceSpace);
          }
        }
        setIsLoader(false);
      } catch (err) {
        console.log("Err", err);
        alert(`${err.message}`);
      }
    }
  };
  const handleSignatureChange = () => {
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    setImage("");
    setSignature(canvasRef.current.toDataURL());
    setIsValue(true);
  };
  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    setImage("");
    setSignature("");
    setIsValue(false);
  };

  const handleClearInitials = () => {
    if (initailsRef.current) {
      initailsRef.current.clear();
    }
    if (imgInitialsRef.current) {
      imgInitialsRef.current.value = "";
    }
    setImgInitials("");
    setInitials("");
    if (image) {
      setIsValue(true);
    }
    setIsInitials(false);
  };

  const onImageChange = async (event) => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setSignature("");
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Img = await toDataUrl(file);
      setImage(base64Img);
      setIsValue(true);
    } else {
      setImage("");
      setIsValue(false);
    }
  };
  const handleSubmit = withSessionValidation(async (e) => {
    e.preventDefault();
    const isUrl = image?.includes("https") || image?.includes("http");
    if (!isvalue) {
      setWarning(true);
      setTimeout(() => setWarning(false), 1000);
    } else {
      setIsLoader(true);
      const sanitizename = generateTitleFromFilename(signName);
      const replaceSpace = sanitizeFileName(sanitizename);
      let file;
      if (signature) {
        file = base64StringtoFile(signature, `${replaceSpace}_sign`);
      } else {
        if (image && !isUrl) {
          file = base64StringtoFile(image, `${replaceSpace}__sign`);
        }
      }
      let imgUrl;
      if (file && !isUrl) {
        imgUrl = await uploadFile(file);
      } else {
        imgUrl = image;
      }
      const isInitialsUrl =
        imgInitials?.includes("https") || imgInitials?.includes("http");

      let initialFile;
      if (Initials) {
        initialFile = base64StringtoFile(Initials, `${replaceSpace}_sign`);
      } else {
        if (imgInitials && !isInitialsUrl) {
          initialFile = base64StringtoFile(
            imgInitials,
            `${replaceSpace}__sign`
          );
        }
      }
      let initialsUrl;
      if (initialFile && !isInitialsUrl) {
        initialsUrl = await uploadFile(initialFile);
      } else {
        initialsUrl = imgInitials;
      }
      const isStampUrl = stamp?.includes("https") || stamp?.includes("http");

      let stampFile;
      if (stamp && !isStampUrl) {
        stampFile = base64StringtoFile(stamp, `${replaceSpace}_stamp`);
      }
      let stampUrl;
      if (stampFile && !isStampUrl) {
        stampUrl = await uploadFile(stampFile);
      } else {
        stampUrl = stamp;
      }
      if (imgUrl) {
        await saveEntry({
          name: signName,
          url: imgUrl,
          initialsUrl: initialsUrl,
          stampUrl: stampUrl
        });
      }
    }
  });
  function base64StringtoFile(base64String, filename) {
    let arr = base64String.split(","),
      // type of uploaded image
      mime = arr[0].match(/:(.*?);/)[1],
      // decode base64
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split("/").pop();
    const name = `${filename}.${ext}`;
    return new File([u8arr], name, { type: mime });
  }

  const uploadFile = async (file) => {
    try {
      const parseFile = new Parse.File(file.name, file);
      const response = await parseFile.save();
      if (response?.url()) {
        const fileRes = await getSecureUrl(response?.url());
        if (fileRes?.url) {
          const tenantId = localStorage.getItem("TenantId");
          const userId = Parse?.User?.current()?.id;
          SaveFileSize(file.size, fileRes?.url, tenantId, userId);
          return fileRes?.url;
        } else {
          alert(t("something-went-wrong-mssg"));
          setIsLoader(false);
          return false;
        }
      } else {
        alert(t("something-went-wrong-mssg"));
        setIsLoader(false);
        return false;
      }
    } catch (err) {
      console.log("sign upload err", err);
      setIsLoader(false);
      alert(`${err.message}`);
    }
  };

  const saveEntry = async (obj) => {
    try {
      const User = Parse?.User?.current()?.id;
      const res = await Parse.Cloud.run("managesign", {
        signature: obj.url,
        userId: User,
        initials: obj.initialsUrl,
        id: id,
        title: obj.name,
        stamp: obj?.stampUrl
      });
      setIsAlert({ type: "success", message: t("signature-saved-alert") });
      return res;
    } catch (err) {
      console.log(err);
      setIsAlert({ type: "danger", message: `${err.message}` });
    } finally {
      setIsLoader(false);
      setTimeout(() => setIsAlert({}), 2000);
    }
  };

  const handleUploadBtn = () => {
    imageRef.current.click();
  };
  const handleInitialsChange = () => {
    setInitials(initailsRef.current.toDataURL());
    if (image || signature) {
      setIsValue(true);
    }
  };
  const handleUploadInitials = () => {
    imgInitialsRef.current.click();
  };
  const onImgInitialsChange = async (event) => {
    if (initailsRef.current) {
      initailsRef.current.clear();
    }
    setInitials("");
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Img = await toDataUrl(file);
      setImgInitials(base64Img);
      if (image || signature) {
        setIsValue(true);
      }
    } else {
      setImgInitials("");
      setIsValue(false);
    }
  };
  const handleClearStamp = () => {
    if (stampRef.current) {
      stampRef.current.clear();
    }
    if (stampRef.current) {
      stampRef.current.value = "";
    }
    setStamp("");
    if (image) {
      setIsValue(true);
    }
  };
  const onStampChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Img = await toDataUrl(file);
      setStamp(base64Img);
      setIsValue(true);
    } else {
      setStamp("");
    }
  };
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        bgcolor: "background.paper",
        color: "text.primary",
        display: "flex",
        boxShadow: 3,
        borderRadius: 3,
        overflow: "auto"
      }}
    >
      {isLoader && (
        <Box
          sx={{
            position: "absolute",
            bgcolor: "rgba(0,0,0,0.3)",
            zIndex: 50,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Loader />
        </Box>
      )}
      {isAlert?.message && <Alert type={isAlert.type}>{isAlert.message}</Alert>}
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box sx={{ ml: "5px", my: "20px", m: { md: "20px" } }}>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 600,
              m: { xs: "10px", md: 0 },
              mb: 1
            }}
          >
            {t("my-signature")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 1, md: 2.5 }
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Box
                component="span"
                sx={{
                  fontWeight: 500,
                  userSelect: "none",
                  display: "flex",
                  mb: "10px"
                }}
              >
                {t("signature")}
              </Box>
              <input
                type="file"
                onChange={onImageChange}
                className="filetype"
                accept="image/*"
                ref={imageRef}
                hidden
              />
              <div>
                {image ? (
                  <div className="mysignatureCanvas relative border-[2px] border-[#888] rounded-box overflow-hidden">
                    <img
                      alt="signature"
                      src={image}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <SignatureCanvas
                    ref={canvasRef}
                    penColor={penColor}
                    canvasProps={{
                      className:
                        "mysignatureCanvas border-[2px] border-[#888] rounded-box"
                    }}
                    onEnd={() =>
                      handleSignatureChange(canvasRef.current.toDataURL())
                    }
                    dotSize={1}
                  />
                )}
                <div className="flex flex-row justify-between w-full">
                  <div>
                    {!image && (
                      <div className="flex flex-row gap-1 m-[5px]">
                        {allColor.map((color, key) => {
                          const selected = penColor === color;
                          return (
                            <i
                              key={key}
                              onClick={() => setPenColor(color)}
                              className={`${COLOR_CLASS[color] ?? ""} ${selected ? "border-current" : "border-white"} cursor-pointer border-b-[2px] pb-[2px] text-[16px] fa-light fa-pen-nib`}
                            ></i>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 1,
                      fontSize: "0.875rem",
                      pr: 1
                    }}
                  >
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      color="primary"
                      onClick={() => handleUploadBtn()}
                    >
                      {t("upload")}
                    </Link>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      color="primary"
                      onClick={() => handleClear()}
                    >
                      {t("clear")}
                    </Link>
                  </Box>
                </div>
                {warning && (
                  <Box
                    component="span"
                    className="customwarning signWarning"
                    sx={{ fontSize: "12px", width: { xs: 220, md: 300 } }}
                  >
                    <Box
                      component="i"
                      className="fa-light fa-exclamation-circle"
                      sx={{ color: "warning.main", fontSize: "15px", mr: "4px" }}
                    />
                    {t("upload-signature/Image")}
                  </Box>
                )}
              </div>
            </Box>

            <Box>
              <Box
                component="span"
                sx={{
                  fontWeight: 500,
                  userSelect: "none",
                  display: "flex",
                  mb: "10px",
                  pl: "10px"
                }}
              >
                {t("initials")}
              </Box>
              <input
                type="file"
                onChange={onImgInitialsChange}
                className="filetype"
                accept="image/*"
                ref={imgInitialsRef}
                hidden
              />
              <div>
                {imgInitials ? (
                  <div className="intialSignature relative border-[1px] border-[#888] rounded-box overflow-hidden">
                    <img
                      alt="inititals"
                      src={imgInitials}
                      className="w-[100%] h-[100%] object-contain"
                    />
                  </div>
                ) : (
                  <SignatureCanvas
                    ref={initailsRef}
                    penColor={initialPen}
                    canvasProps={{
                      className: "intialSignature rounded-box"
                    }}
                    onEnd={() => handleInitialsChange()}
                    dotSize={1}
                  />
                )}
                <div
                  className={`${isInitials ? "justify-between" : ""} flex flex-row gap-1`}
                >
                  <div>
                    {!isInitials && (
                      <div className="flex flex-row gap-1 m-[5px]">
                        {allColor.map((color, key) => {
                          const selected = initialPen === color;
                          return (
                            <i
                              key={key}
                              onClick={() => setInitialPen(color)}
                              className={`${COLOR_CLASS[color] ?? ""} ${selected ? "border-current" : "border-white"} cursor-pointer border-b-[2px] pb-[2px] text-[16px] fa-light fa-pen-nib`}
                            ></i>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 0.75,
                      fontSize: "0.875rem"
                    }}
                  >
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      color="primary"
                      onClick={() => handleUploadInitials()}
                    >
                      {t("upload")}
                    </Link>
                    <Box>
                      <Link
                        component="button"
                        type="button"
                        underline="hover"
                        color="primary"
                        onClick={() => handleClearInitials()}
                      >
                        {t("clear")}
                      </Link>
                    </Box>
                  </Box>
                </div>
              </div>
            </Box>
            <Box>
              <Box
                component="span"
                sx={{
                  fontWeight: 500,
                  userSelect: "none",
                  display: "flex",
                  mb: "10px",
                  pl: "10px"
                }}
              >
                Stamp
              </Box>

              <div
                onClick={() => stampRef.current.click()}
                className="mystampCanvas opensigndark:bg-[#1f2937] cursor-pointer border-[2px] opensigncss:border-[#888] opensigndark:border-[#4b5563] rounded-box flex flex-col overflow-hidden w-full h-full aspect-[5/2] justify-center items-center mr-2"
              >
                {stamp ? (
                  <img
                    alt="signature"
                    src={stamp}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <input
                      onChange={onStampChange}
                      type="file"
                      className="filetype"
                      accept="image/png,image/jpeg"
                      hidden
                      ref={stampRef}
                    />
                    <Box
                      component="i"
                      className="fa-light fa-cloud-upload-alt"
                      sx={{ color: "text.primary", fontSize: "28px" }}
                    />
                    <Typography sx={{ fontSize: "15px" }}>
                      {t("upload")}
                    </Typography>
                  </>
                )}
              </div>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 1.5 }}>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  color="primary"
                  sx={{ fontSize: "0.875rem" }}
                  onClick={() => handleClearStamp()}
                >
                  {t("clear")}
                </Link>
              </Box>
            </Box>
          </Box>
          <Box sx={{ pt: 1.5, ml: { xs: 1, md: 0 } }}>
            <Button variant="contained" onClick={(e) => handleSubmit(e)}>
              {t("save")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ManageSign;
