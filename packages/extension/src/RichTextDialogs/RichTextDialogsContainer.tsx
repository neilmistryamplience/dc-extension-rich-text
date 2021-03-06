import React, { PropsWithChildren } from "react";

import {
  Hyperlink,
  Image,
  RichTextDialogs
} from "@dc-extension-rich-text/common";
import { ContentItemLink, MediaImageLink } from "dc-extensions-sdk";
import HyperlinkDialog from "../HyperlinkDialog/HyperlinkDialog";
import ImageDialog from "../ImageDialog/ImageDialog";
import RichTextDialogsContext from "./RichTextDialogsContext";

import { SdkContext } from "unofficial-dynamic-content-ui";

interface EditorDialogsProps extends PropsWithChildren<{}> {}

interface OpenDialog {
  type: string;
  resolve: (value: any) => void;
  reject: () => void;
}

const RichTextDialogsContainer: React.SFC<EditorDialogsProps> = (
  props: EditorDialogsProps
) => {
  const { children } = props;

  const [openDialog, setOpenDialog] = React.useState<OpenDialog>();

  const handleCloseDialog = React.useCallback(() => {
    if (openDialog) {
      openDialog.reject();
    }
    setOpenDialog(undefined);
  }, [openDialog, setOpenDialog]);

  const handleSubmitDialog = React.useCallback(
    (value: any) => {
      if (openDialog) {
        openDialog.resolve(value);
      }
      setOpenDialog(undefined);
    },
    [openDialog, setOpenDialog]
  );

  const handleOpenDialog = React.useCallback(
    (type: string) => {
      return new Promise((resolve, reject) => {
        setOpenDialog({
          type,
          resolve,
          reject
        });
      });
    },
    [setOpenDialog]
  );

  const { sdk } = React.useContext(SdkContext);

  const dialogs: RichTextDialogs = {
    getHyperlink: (value?: Hyperlink): Promise<Hyperlink> => {
      return handleOpenDialog("hyperlink") as Promise<Hyperlink>;
    },
    getImage: (value?: Image): Promise<Image> => {
      return handleOpenDialog("image") as Promise<Image>;
    },
    getDcImageLink: (value?: MediaImageLink): Promise<MediaImageLink> => {
      if (!sdk) {
        return Promise.reject();
      } else {
        return sdk.mediaLink.getImage();
      }
    },
    getDcContentLink: (
      contentTypeIds: string[],
      value?: ContentItemLink
    ): Promise<ContentItemLink> => {
      if (!sdk) {
        return Promise.reject();
      } else {
        return sdk.contentLink.get(contentTypeIds);
      }
    }
  };

  return (
    <RichTextDialogsContext.Provider value={{ dialogs }}>
      {children}

      <HyperlinkDialog
        open={openDialog != null && openDialog.type === "hyperlink"}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
      />
      <ImageDialog
        open={openDialog != null && openDialog.type === "image"}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
      />
    </RichTextDialogsContext.Provider>
  );
};

export default RichTextDialogsContainer;
