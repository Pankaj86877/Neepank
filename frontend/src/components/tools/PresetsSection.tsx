import React from "react";
import { ShapeStudioCard, ShapeConfig } from "./ShapeStudioCard";

export const PresetsSection = () => {
  const shapeConfigs: ShapeConfig[] = [
    {
      id: "card-shape-1",
      title: "Shape 1 — Custom",
      w: 973,
      h: 973,
      r: 260,
      color: "#2DBFF9",
      fileName: "shape_1_973x973",
      diagonalStrategy: "secondary",
      shapeType: "custom-diagonal"
    },
    {
      id: "card-circle",
      title: "Circle",
      w: 1000,
      h: 1000,
      r: 0,
      color: "#43E098",
      fileName: "circle_1000x1000",
      shapeType: "circle"
    },
    {
      id: "card-square",
      title: "Square",
      w: 1000,
      h: 1000,
      r: 0,
      color: "#F95C15",
      fileName: "square_1000x1000",
      shapeType: "square"
    },
    {
      id: "card-rectangle",
      title: "Rectangle (4:3)",
      w: 1200,
      h: 900,
      r: 0,
      color: "#286070",
      fileName: "rectangle_1200x900",
      shapeType: "rectangle"
    },
    {
      id: "card-landscape",
      title: "Landscape (16:9)",
      w: 1920,
      h: 1080,
      r: 0,
      color: "#072942",
      fileName: "landscape_1920x1080",
      shapeType: "rectangle"
    },
    {
      id: "card-portrait",
      title: "Portrait (3:4)",
      w: 900,
      h: 1200,
      r: 0,
      color: "#DDFFEA",
      fileName: "portrait_900x1200",
      shapeType: "rectangle"
    },
    {
      id: "card-story",
      title: "Story (9:16)",
      w: 1080,
      h: 1920,
      r: 0,
      color: "#E8F0F2",
      fileName: "story_1080x1920",
      shapeType: "rectangle"
    },
    {
      id: "card-yt-thumb",
      title: "YouTube Thumbnail",
      w: 1280,
      h: 720,
      r: 0,
      color: "#70D5FA",
      fileName: "yt_thumb_1280x720",
      shapeType: "rectangle"
    },
    {
      id: "card-rounded-rect",
      title: "Rounded Rectangle",
      w: 1200,
      h: 900,
      r: 100,
      color: "#71EAAE",
      fileName: "rounded_rect_1200x900",
      shapeType: "rounded-rectangle"
    },
    {
      id: "card-oval",
      title: "Oval",
      w: 1200,
      h: 900,
      r: 0,
      color: "#407A8A",
      fileName: "oval_1200x900",
      shapeType: "oval"
    },
    {
      id: "card-hexagon",
      title: "Hexagon",
      w: 1000,
      h: 1000,
      r: 0,
      color: "#FA8047",
      fileName: "hexagon_1000x1000",
      shapeType: "hexagon"
    }
  ];

  return (
    <div style={{ padding: 'clamp(18px, 3vw, 38px) clamp(16px, 3vw, 36px) 50px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 6px', fontWeight: 800 }}>Shape Presets</h1>
        <p className="sub">11 predefined geometries and standard aspect ratios for everyday design workflows.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {shapeConfigs.map((config) => (
          <ShapeStudioCard key={config.id} config={config} />
        ))}
      </div>
    </div>
  );
};

