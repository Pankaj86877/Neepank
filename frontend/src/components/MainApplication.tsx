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
const ColorPaletteSection = dynamic(() => import("./tools/ColorPaletteSection").then(m => m.ColorPaletteSection), { ssr: false });
const SVGOptimizerSection = dynamic(() => import("./tools/SVGOptimizerSection").then(m => m.SVGOptimizerSection), { ssr: false });
const ResizerSection = dynamic(() => import("./tools/ResizerSection").then(m => m.ResizerSection), { ssr: false });
const JSONDateConverterSection = dynamic(() => import("./tools/JSONDateConverterSection").then(m => m.JSONDateConverterSection), { ssr: false });
const ImageToCssSection = dynamic(() => import("./tools/ImageToCssSection").then(m => m.ImageToCssSection), { ssr: false });

const SectionRouter = () => {
  const { activeSection, openTabs } = useAppContext();

  // Helper to check if a tab should be mounted (opened at least once)
  const isMounted = (id: string) => openTabs.includes(id) || activeSection === id;

  return (
    <>
      <div className="pane" hidden={activeSection !== "home"}><HomeView /></div>
      {isMounted("presets") && <div className="pane" hidden={activeSection !== "presets"}><PresetsSection /></div>}
      {isMounted("custom") && <div className="pane" hidden={activeSection !== "custom"}><CustomShapesSection /></div>}
      {isMounted("shape-image") && <div className="pane" hidden={activeSection !== "shape-image"}><ShapeYourImageSection /></div>}
      {isMounted("extractor") && <div className="pane" hidden={activeSection !== "extractor"}><ImageExtractorSection /></div>}
      {isMounted("ocr") && <div className="pane" hidden={activeSection !== "ocr"}><OCRSection /></div>}
      {isMounted("png-overlay") && <div className="pane" hidden={activeSection !== "png-overlay"}><PNGOverlaySection /></div>}
      {isMounted("pdf-converter") && <div className="pane" hidden={activeSection !== "pdf-converter"}><PDFConverterSection /></div>}
      {isMounted("format-converter") && <div className="pane" hidden={activeSection !== "format-converter"}><FormatConverterSection /></div>}
      {isMounted("mp4-to-gif") && <div className="pane" hidden={activeSection !== "mp4-to-gif"}><MP4ToGIFSection /></div>}
      {isMounted("qr-generator") && <div className="pane" hidden={activeSection !== "qr-generator"}><QRGeneratorSection /></div>}
      {isMounted("data-transfer") && <div className="pane" hidden={activeSection !== "data-transfer"}><DataTransferSection /></div>}
      {isMounted("json-date") && <div className="pane" hidden={activeSection !== "json-date"}><JSONDateConverterSection /></div>}
      {isMounted("image-to-css") && <div className="pane" hidden={activeSection !== "image-to-css"}><ImageToCssSection /></div>}
      {isMounted("color-palette") && <div className="pane" hidden={activeSection !== "color-palette"}><ColorPaletteSection /></div>}
      {isMounted("svg-optimizer") && <div className="pane" hidden={activeSection !== "svg-optimizer"}><SVGOptimizerSection /></div>}
      {isMounted("photo-resizer") && <div className="pane" hidden={activeSection !== "photo-resizer"}><ResizerSection /></div>}
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

