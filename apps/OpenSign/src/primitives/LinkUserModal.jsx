import { useEffect, useState } from "react";
import SelectSigners from "../components/shared/fields/SelectSigners";
import AddContact from "./AddContact";
import ModalUi from "./ModalUi";
import { useTranslation } from "react-i18next";
import Divider from "@mui/material/Divider";

const LinkUserModal = (props) => {
  const { t } = useTranslation();
  const [isContact, setIsContact] = useState(false);
  const [isExistSigner, setIsExistSIgner] = useState(false);

  useEffect(() => {
    if (props.uniqueId) {
      const isExistSigner = props.signerPos.find(
        (x) => x.Id === props.uniqueId && x.signerObjId
      );
      setIsExistSIgner(isExistSigner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.signerPos]);
  return (
    <ModalUi
      title={isExistSigner ? t("change-signer") : t("add/choose-signer")}
      isOpen={true}
      handleClose={props.closePopup}
    >
      <SelectSigners
        {...props}
        isContact={isContact}
        setIsContact={setIsContact}
        isExistSigner={isExistSigner}
      />
      {isContact && (
        <>
          <Divider sx={{ mx: "25%", my: 0.5, color: "text.primary" }}>
            {t("or")}
          </Divider>
          <AddContact {...props} details={props.handleAddUser} />
        </>
      )}
    </ModalUi>
  );
};

export default LinkUserModal;
