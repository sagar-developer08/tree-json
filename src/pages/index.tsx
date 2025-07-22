import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMantineColorScheme } from "@mantine/core";
import "@mantine/dropzone/styles.css";
import styled, { ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { NextSeo } from "next-seo";
import { SEO } from "../constants/seo";
import { darkTheme } from "../constants/theme";
import { BottomBar } from "../features/editor/BottomBar";
import { FullscreenDropzone } from "../features/editor/FullscreenDropzone";
import { Toolbar } from "../features/editor/Toolbar";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import useConfig from "../store/useConfig";
import useFile from "../store/useFile";

const ModalController = dynamic(() => import("../features/modals/ModalController"), {
  ssr: false,
});
const ExternalMode = dynamic(() => import("../features/editor/ExternalMode"), {
  ssr: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const StyledPageWrapper = styled.div`
  height: calc(100vh - 27px);
  width: 100%;

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

export const StyledEditorWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const StyledEditor = styled(Allotment)`
  position: relative !important;
  display: flex;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
  height: calc(100vh - 67px);

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

const TextEditor = dynamic(() => import("../features/editor/TextEditor"), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading Editor...</div>
});

const LiveEditor = dynamic(() => import("../features/editor/LiveEditor"), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading Graph...</div>
});

const HomePage = () => {
  const { query, isReady } = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const checkEditorSession = useFile(state => state.checkEditorSession);
  const fullscreen = useGraph(state => state.fullscreen);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isReady && isClient) {
      checkEditorSession(query?.json);
    }
  }, [checkEditorSession, isReady, query, isClient]);

  useEffect(() => {
    if (isClient) {
      // Force light mode only on client
      setColorScheme("light");
    }
  }, [setColorScheme, isClient]);

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <NextSeo
        {...SEO}
        title="Data Editor"
        description="A powerful editor tool for visualizing into graphs, analyzing, editing, formatting, querying, transforming and validating JSON, CSV, YAML, XML, and more."
        canonical="https://jsoncrack.com"
      />
      <ThemeProvider theme={darkTheme}>
        <QueryClientProvider client={queryClient}>
          <ExternalMode />
          <ModalController />
          <StyledEditorWrapper>
            <StyledPageWrapper>
              <Toolbar />
              <StyledEditorWrapper>
                <StyledEditor proportionalLayout={false} key={`editor-${isClient}`}>
                  <Allotment.Pane
                    preferredSize={450}
                    minSize={fullscreen ? 0 : 300}
                    maxSize={800}
                    visible={!fullscreen}
                  >
                    <TextEditor />
                  </Allotment.Pane>
                  <Allotment.Pane minSize={0}>
                    <LiveEditor />
                  </Allotment.Pane>
                </StyledEditor>
                <FullscreenDropzone />
              </StyledEditorWrapper>
            </StyledPageWrapper>
            <BottomBar />
          </StyledEditorWrapper>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
};

export default HomePage;
