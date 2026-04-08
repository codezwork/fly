// Centralized mock data layer for FLY STORE

export const COLLECTIONS = [
  { 
    id: "col_1", 
    name: "FW24 CORE", 
    handle: "fw24-core", 
    description: "The foundational pieces of the brutalist silhouette.",
    featureVideoUrl: "https://videos.pexels.com/video-files/3205342/3205342-uhd_2560_1440_25fps.mp4",
    posterUrl: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1485&auto=format&fit=crop"
  },
  { 
    id: "col_2", 
    name: "OBJECTS", 
    handle: "objects", 
    description: "Hardware and utilitarian accessories engineered for everyday impact.",
    featureVideoUrl: "https://videos.pexels.com/video-files/5198223/5198223-uhd_2560_1440_25fps.mp4",
    posterUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1287&auto=format&fit=crop"
  },
  { 
    id: "col_3", 
    name: "ESSENTIALS", 
    handle: "essentials", 
    description: "Elevated daily wear requiring zero thought.",
    featureVideoUrl: "https://videos.pexels.com/video-files/8009270/8009270-uhd_2560_1440_30fps.mp4",
    posterUrl: "https://images.unsplash.com/photo-1509118749826-b8cb2f43d0f0?q=80&w=1328&auto=format&fit=crop"
  },
  { 
    id: "col_4", 
    name: "ARCHIVE", 
    handle: "archive", 
    description: "Limited releases from our developmental phases. Extinct styles.",
    featureVideoUrl: "https://videos.pexels.com/video-files/4204561/4204561-uhd_2560_1440_25fps.mp4",
    posterUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop"
  },
];

export const PRODUCTS = [
  {
    id: "prod_1",
    handle: "heavyweight-hoodie-black",
    name: "HEAVYWEIGHT HOODIE",
    price: "120",
    category: "Outerwear",
    collectionHandle: "fw24-core",
    imageStudio: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop"],
    imageLifestyle: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop"],
  },
  {
    id: "prod_2",
    handle: "structured-tee-white",
    name: "STRUCTURED TEE",
    price: "65",
    category: "Tops",
    collectionHandle: "essentials",
    imageStudio: ["https://i.etsystatic.com/58944277/r/il/f6e7ef/7111207716/il_1588xN.7111207716_duu3.jpg"],
    imageLifestyle: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop"],
  },
  {
    id: "prod_3",
    handle: "cargo-trouser-olive",
    name: "CARGO TROUSER",
    price: "150",
    category: "Bottoms",
    collectionHandle: "fw24-core",
    imageStudio: ["https://blvck.com/cdn/shop/files/04_6d79e4cc-a0bf-4120-baed-940db087a605.jpg?v=1747047569&width=1280"],
    imageLifestyle: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop"],
  },
  {
    id: "prod_4",
    handle: "nylon-bomber-black",
    name: "NYLON BOMBER",
    price: "200",
    category: "Outerwear",
    collectionHandle: "archive",
    imageStudio: ["https://genzprints.in/cdn/shop/articles/Untitled_design_59.png?v=1769545627"],
    imageLifestyle: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop"],
  },
  {
    id: "prod_5",
    handle: "industrial-belt",
    name: "INDUSTRIAL BELT",
    price: "45",
    category: "Accessories",
    collectionHandle: "objects",
    imageStudio: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1287&auto=format&fit=crop"],
    imageLifestyle: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1287&auto=format&fit=crop"],
  },
];
