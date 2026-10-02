export type Palette = {
  name: string;
  colors: string[];
};

export type Category = {
  id: string;
  name: string;
  palettes: Palette[];
};

export const STYLE_CATEGORIES: Category[] = [
  {
    id: "minimal",
    name: "Minimal & Modern",
    palettes: [
      { name: "Nordic Minimal", colors: ["#ECEFF4", "#E5E9F0", "#D8DEE9", "#4C566A", "#2E3440"] },
      { name: "Clean Slate", colors: ["#FFFFFF", "#F3F4F6", "#9CA3AF", "#4B5563", "#111827"] },
      { name: "Warm Minimal", colors: ["#F9F9F9", "#F2F0EB", "#D1CCC0", "#595959", "#2C2C2C"] }
    ]
  },
  {
    id: "luxury",
    name: "Luxury & Premium",
    palettes: [
      { name: "Gold & Obsidian", colors: ["#0F0F0F", "#1A1A1A", "#333333", "#D4AF37", "#F3E5AB"] },
      { name: "Platinum Noir", colors: ["#000000", "#141414", "#E5E4E2", "#FFFFFF", "#707070"] },
      { name: "Emerald Class", colors: ["#022B3A", "#1F7A8C", "#BFDBF7", "#E1E5F2", "#FFFFFF"] }
    ]
  },
  {
    id: "elegant",
    name: "Elegant & Sophisticated",
    palettes: [
      { name: "Dusty Rose", colors: ["#F4ECE6", "#E9D8CE", "#C8B4A6", "#8F7C73", "#4A3F3A"] },
      { name: "Midnight Silk", colors: ["#0D1117", "#161B22", "#4A5568", "#A0AEC0", "#E2E8F0"] },
      { name: "Ivory & Taupe", colors: ["#FFFFF0", "#FAF0E6", "#EEDC82", "#8B8682", "#4A4A4A"] }
    ]
  },
  {
    id: "vibrant",
    name: "Vibrant & Energetic",
    palettes: [
      { name: "Cyber Punk", colors: ["#FCEE09", "#00FF41", "#00FFFF", "#FF00FF", "#000000"] },
      { name: "Summer Pop", colors: ["#FF4E50", "#FC913A", "#F9D423", "#EDE574", "#E1F5C4"] },
      { name: "Electric Dream", colors: ["#4facfe", "#00f2fe", "#43e97b", "#38f9d7", "#fff1eb"] }
    ]
  },
  {
    id: "nature",
    name: "Nature & Earthy",
    palettes: [
      { name: "Forest Canopy", colors: ["#2C3E50", "#27AE60", "#2ECC71", "#F1C40F", "#ECF0F1"] },
      { name: "Desert Sand", colors: ["#E6D0CE", "#D2B48C", "#CD853F", "#A0522D", "#6B4226"] },
      { name: "Ocean Breeze", colors: ["#E0FFFF", "#B0E0E6", "#87CEFA", "#4682B4", "#000080"] }
    ]
  },
  {
    id: "pastel",
    name: "Pastel & Soft",
    palettes: [
      { name: "Cotton Candy", colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"] },
      { name: "Minty Fresh", colors: ["#F0FFF0", "#E0FFFF", "#F0FFFF", "#F5FFFA", "#F0F8FF"] },
      { name: "Lavender Dream", colors: ["#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#FF00FF"] }
    ]
  },
  {
    id: "dark",
    name: "Dark & Moody",
    palettes: [
      { name: "Deep Space", colors: ["#0B0C10", "#1F2833", "#C5C6C7", "#66FCF1", "#45A29E"] },
      { name: "Dracula", colors: ["#282a36", "#44475a", "#f8f8f2", "#bd93f9", "#ff79c6"] },
      { name: "Abyss", colors: ["#000000", "#111111", "#222222", "#333333", "#444444"] }
    ]
  },
  {
    id: "corporate",
    name: "Corporate & Professional",
    palettes: [
      { name: "Trust Blue", colors: ["#F4F7F6", "#87B2C5", "#27496D", "#0C2340", "#000000"] },
      { name: "Executive Slate", colors: ["#FFFFFF", "#E2E8F0", "#94A3B8", "#475569", "#0F172A"] },
      { name: "Financial Growth", colors: ["#FFFFFF", "#E6F4EA", "#CEEAD6", "#34A853", "#0F9D58"] }
    ]
  },
  {
    id: "vintage",
    name: "Vintage & Retro",
    palettes: [
      { name: "70s Sunset", colors: ["#F9A03F", "#F7D08A", "#F3F3F3", "#9B4A31", "#592E21"] },
      { name: "Polaroid", colors: ["#F1E3D3", "#D9C3A9", "#A68A6B", "#705A44", "#3D3124"] },
      { name: "Arcade", colors: ["#FF0055", "#00FFCC", "#FFCC00", "#3300FF", "#111111"] }
    ]
  },
  {
    id: "monochromatic",
    name: "Monochromatic",
    palettes: [
      { name: "Crimson Scale", colors: ["#FFEBEE", "#EF9A9A", "#EF5350", "#C62828", "#B71C1C"] },
      { name: "Navy Scale", colors: ["#E3F2FD", "#90CAF9", "#42A5F5", "#1565C0", "#0D47A1"] },
      { name: "Emerald Scale", colors: ["#E8F5E9", "#A5D6A7", "#4CAF50", "#2E7D32", "#1B5E20"] }
    ]
  }
];

export const INDUSTRY_CATEGORIES: Category[] = [
  {
    id: "cafe",
    name: "Café & Coffee Shop",
    palettes: [
      { name: "Espresso Roast", colors: ["#4A3B32", "#8E6E53", "#C4A484", "#EADDCA", "#F5F5DC"] },
      { name: "Matcha Latte", colors: ["#F0F4E8", "#D2E4C4", "#A8CC8B", "#6B8E4E", "#3A5320"] },
      { name: "Warm Pastry", colors: ["#FFF5E1", "#FDE0B4", "#F4A460", "#D2691E", "#8B4513"] }
    ]
  },
  {
    id: "restaurant",
    name: "Restaurant",
    palettes: [
      { name: "Fine Dining", colors: ["#121212", "#2C2C2C", "#B08D57", "#D4AF37", "#F9F6F0"] },
      { name: "Spicy Grill", colors: ["#FF4500", "#FF8C00", "#FFD700", "#8B0000", "#1A1A1A"] },
      { name: "Fresh Organic", colors: ["#FFFFFF", "#F0F8FF", "#8FBC8F", "#2E8B57", "#006400"] }
    ]
  },
  {
    id: "hotel",
    name: "Hotel & Hospitality",
    palettes: [
      { name: "Boutique Resort", colors: ["#FDFBF7", "#E4DCD3", "#B3A492", "#5E503F", "#22333B"] },
      { name: "Coastal Stay", colors: ["#F0F8FF", "#B0E0E6", "#87CEFA", "#F5DEB3", "#D2B48C"] },
      { name: "Urban Suite", colors: ["#1A1A1A", "#333333", "#7F8C8D", "#BDC3C7", "#FFFFFF"] }
    ]
  },
  {
    id: "perfume",
    name: "Perfume & Fragrance",
    palettes: [
      { name: "Floral Notes", colors: ["#FDF5E6", "#FADADD", "#FFB6C1", "#DB7093", "#C71585"] },
      { name: "Oud & Wood", colors: ["#1A1110", "#3E2723", "#5D4037", "#8D6E63", "#D7CCC8"] },
      { name: "Citrus Splash", colors: ["#FFFFE0", "#FFFACD", "#FFD700", "#FFA500", "#FF8C00"] }
    ]
  },
  {
    id: "beauty",
    name: "Beauty & Cosmetics",
    palettes: [
      { name: "Nude Palette", colors: ["#FFF0F5", "#FFE4E1", "#FFC0CB", "#FF69B4", "#C71585"] },
      { name: "Clean Skincare", colors: ["#FFFFFF", "#F0FFFF", "#E0FFFF", "#AFEEEE", "#48D1CC"] },
      { name: "Bold Glamour", colors: ["#000000", "#1A1A1A", "#FF0000", "#8B0000", "#FFD700"] }
    ]
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    palettes: [
      { name: "Monochrome Chic", colors: ["#FFFFFF", "#F5F5F5", "#9E9E9E", "#424242", "#000000"] },
      { name: "Streetwear", colors: ["#000000", "#FF4500", "#FFFF00", "#00FF00", "#00FFFF"] },
      { name: "Earthy Boho", colors: ["#F5DEB3", "#D2B48C", "#BC8F8F", "#A0522D", "#8B4513"] }
    ]
  },
  {
    id: "realestate",
    name: "Real Estate",
    palettes: [
      { name: "Modern Home", colors: ["#FFFFFF", "#F0F2F5", "#8E9EAB", "#3A506B", "#1C2541"] },
      { name: "Luxury Estate", colors: ["#111111", "#222222", "#D4AF37", "#C5B358", "#FDFCF0"] },
      { name: "Eco Living", colors: ["#F9F9F9", "#E8F5E9", "#81C784", "#388E3C", "#1B5E20"] }
    ]
  },
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    palettes: [
      { name: "Clinical Trust", colors: ["#FFFFFF", "#F0F8FF", "#ADD8E6", "#4682B4", "#000080"] },
      { name: "Healing Green", colors: ["#FFFFFF", "#F5FFFA", "#98FB98", "#3CB371", "#2E8B57"] },
      { name: "Calm Mind", colors: ["#F8F8FF", "#E6E6FA", "#D8BFD8", "#BA55D3", "#4B0082"] }
    ]
  },
  {
    id: "technology",
    name: "Technology & SaaS",
    palettes: [
      { name: "Startup Blue", colors: ["#FFFFFF", "#F0F4F8", "#D9E2EC", "#334E68", "#102A43"] },
      { name: "Dark Mode", colors: ["#0F172A", "#1E293B", "#334155", "#38BDF8", "#F8FAFC"] },
      { name: "Neon Tech", colors: ["#000000", "#111111", "#00FF00", "#00FFFF", "#FF00FF"] }
    ]
  },
  {
    id: "bakery",
    name: "Bakery & Dessert",
    palettes: [
      { name: "Cupcake", colors: ["#FFF0F5", "#FFE4E1", "#FFB6C1", "#FF69B4", "#DB7093"] },
      { name: "Chocolate Box", colors: ["#3E2723", "#4E342E", "#5D4037", "#6D4C41", "#795548"] },
      { name: "Macaron", colors: ["#FFDAB9", "#E6E6FA", "#FFFACD", "#E0FFFF", "#F0FFF0"] }
    ]
  },
  {
    id: "spa",
    name: "Spa & Salon",
    palettes: [
      { name: "Zen Stone", colors: ["#F5F5F5", "#E0E0E0", "#9E9E9E", "#616161", "#424242"] },
      { name: "Lotus Flower", colors: ["#FFFFFF", "#FFF0F5", "#FFC0CB", "#FF69B4", "#C71585"] },
      { name: "Bamboo Water", colors: ["#F0FFF0", "#E0FFFF", "#AFEEEE", "#7FFFD4", "#40E0D0"] }
    ]
  },
  {
    id: "jewellery",
    name: "Jewellery",
    palettes: [
      { name: "Diamond & Pearl", colors: ["#FFFFFF", "#F8F8FF", "#F0F8FF", "#E6E6FA", "#DCDCDC"] },
      { name: "Gold & Ruby", colors: ["#1A1A1A", "#333333", "#D4AF37", "#8B0000", "#FF0000"] },
      { name: "Silver & Sapphire", colors: ["#FFFFFF", "#C0C0C0", "#A9A9A9", "#000080", "#0000FF"] }
    ]
  },
  {
    id: "travel",
    name: "Travel & Tourism",
    palettes: [
      { name: "Tropical Island", colors: ["#00CED1", "#20B2AA", "#32CD32", "#FFD700", "#FF8C00"] },
      { name: "Mountain Peak", colors: ["#FFFFFF", "#F0F8FF", "#ADD8E6", "#778899", "#2F4F4F"] },
      { name: "City Lights", colors: ["#191970", "#000080", "#4B0082", "#FFD700", "#FFA500"] }
    ]
  },
  {
    id: "education",
    name: "Education",
    palettes: [
      { name: "Primary Colors", colors: ["#FFFFFF", "#FF0000", "#0000FF", "#FFFF00", "#008000"] },
      { name: "Campus Ivy", colors: ["#F5F5DC", "#D2B48C", "#8B4513", "#228B22", "#006400"] },
      { name: "Modern Learning", colors: ["#FFFFFF", "#F0F8FF", "#87CEEB", "#4169E1", "#0000CD"] }
    ]
  }
];
