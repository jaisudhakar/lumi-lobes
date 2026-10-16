// Details for the "Who built this" section on the homepage.
// Any link left as "" is hidden on the site, so fill these in as you have them.

import { asset } from "./basePath";

export const author = {
  name: "Sudhakar Arunachalam",
  shortName: "Sudhakar",
  photo: asset("/about/sudhakar.webp"),
  role: "Full-stack eCommerce developer · Shopify Partner",
  location: "Coimbatore, India",
  availability: "open to freelance work",
  email: "jaisudhakar96@gmail.com",

  stats: [
    { value: "8+", label: "years shipping eCommerce" },
    { value: "16", label: "client stores and sites" },
    { value: "6", label: "desktop tools built" },
  ],

  links: {
    portfolio: "",
    source: "https://github.com/jaisudhakar/lumi-lobes",
  },

  social: {
    linkedin: "",
    github: "https://github.com/jaisudhakar",
    instagram: "",
    /** Full wa.me link, e.g. https://wa.me/919876543210 */
    whatsapp: "",
  },

  tools: [
    { name: "ClipKeeper", text: "Clipboard history for Ubuntu and Windows", icon: "clipboard", url: "" },
    { name: "Hangly", text: "Swinging desktop charms for macOS and Windows", icon: "charm", url: "" },
    { name: "Pendu Reminder", text: "Daily sticky notes that open with your laptop", icon: "note", url: "" },
    { name: "WeBook", text: "A 3D flip-page book you can write in", icon: "book", url: "" },
  ],
} as const;
