"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppProvider, useAppContext } from "@/store/AppContext";
import { WorkspaceLayout } from "./layout/WorkspaceLayout";
import { HomeView } from "./HomeView";

const PresetsSection = dynamic(() => import("./tools/PresetsSection").then(m => m.PresetsSection), { ssr: false });
const CustomShapesSection = dynamic(() => import("./tools/CustomShapesSection").then(m => m.CustomShapesSection), { ssr: false });
const ShapeYourImageSection = dynamic(() => import("./tools/ShapeYourImageSection").then(m => m.ShapeYourImageSection), { ssr: false });
const ImageExtractorSection = dynamic(() => import("./tools/ImageExtractorSection").then(m => m.ImageExtractorSection), { ssr: false });
const OCRSection = dynamic(() => import("./tools/OCRSection").then(m => m.OCRSection), { ssr: false });
const PNGOverlaySection = dynamic(() => import("./tools/PNGOverlaySection").then(m => m.PNGOverlaySection), { ssr: false });
const PDFConverterSection = dynamic(() => import("./tools/PDFConverterSection").then(m => m.PDFConverterSection), { ssr: false });
const FormatConverterSection = dynamic(() => import("./tools/FormatConverterSection").then(m => m.FormatConverterSection), { ssr: false });
const MP4ToGIFSection = dynamic(() => import("./tools/MP4ToGIFSection").then(m => m.MP4ToGIFSection), { ssr: false });
const QRGeneratorSection = dynamic(() => import("./tools/QRGeneratorSection").then(m => m.QRGeneratorSection), { ssr: false });
const DataTransferSection = dynamic(() => import("./tools/DataTransferSection").then(m => m.DataTransferSection), { ssr: false });

const SectionRouter = () => {
  const { activeSection } = useAppContext();

  return (
    <>
      <div className="pane" hidden={activeSection !== "home"}><HomeView /></div>
      <div className="pane" hidden={activeSection !== "presets"}><PresetsSection /></div>
      <div className="pane" hidden={activeSection !== "custom"}><CustomShapesSection /></div>
      <div className="pane" hidden={activeSection !== "shape-image"}><ShapeYourImageSection /></div>
      <div className="pane" hidden={activeSection !== "extractor"}><ImageExtractorSection /></div>
      <div className="pane" hidden={activeSection !== "ocr"}><OCRSection /></div>
      <div className="pane" hidden={activeSection !== "png-overlay"}><PNGOverlaySection /></div>
      <div className="pane" hidden={activeSection !== "pdf-converter"}><PDFConverterSection /></div>
      <div className="pane" hidden={activeSection !== "format-converter"}><FormatConverterSection /></div>
      <div className="pane" hidden={activeSection !== "mp4-to-gif"}><MP4ToGIFSection /></div>
      <div className="pane" hidden={activeSection !== "qr-generator"}><QRGeneratorSection /></div>
      <div className="pane" hidden={activeSection !== "data-transfer"}><DataTransferSection /></div>
    </>
  );
};

export const MainApplication = () => {
  return (
    <AppProvider>
      <WorkspaceLayout>
        <SectionRouter />
      </WorkspaceLayout>
    </AppProvider>
  );
};

