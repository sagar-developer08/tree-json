import React from "react";
import Link from "next/link";
import { Flex, Group, Select, Button } from "@mantine/core";
import styled from "styled-components";
import toast from "react-hot-toast";
import { AiOutlineFullscreen } from "react-icons/ai";
import { FaFireFlameCurved, FaGithub } from "react-icons/fa6";
import { type FileFormat, formats } from "../../../enums/file.enum";
import { JSONCrackLogo } from "../../../layout/JsonCrackLogo";
import useFile from "../../../store/useFile";
import { ApiControls } from "../../../components/ApiControls";
import { FileMenu } from "./FileMenu";
import { ToolsMenu } from "./ToolsMenu";
import { ViewMenu } from "./ViewMenu";
import { StyledToolElement } from "./styles";

const StyledTools = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  justify-content: space-between;
  height: 40px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.TOOLBAR_BG};
  color: ${({ theme }) => theme.SILVER};
  z-index: 36;
  border-bottom: 1px solid ${({ theme }) => theme.SILVER_DARK};

  @media only screen and (max-width: 320px) {
    display: none;
  }
`;

function fullscreenBrowser() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      toast.error("Unable to enter fullscreen mode.");
    });
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

export const Toolbar = () => {
  const setFormat = useFile(state => state.setFormat);
  const format = useFile(state => state.format);

  return (
    <StyledTools style={{ display: 'none' }}>
    </StyledTools>
  );
};
