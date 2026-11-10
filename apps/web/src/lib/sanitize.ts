import sanitizeHtml from "sanitize-html";

/** Allow-list for blog rich text (what the editor can produce). Strips scripts, event handlers, iframes, etc. */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "br", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li",
    "a", "img", "span", "mark", "hr", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    "*": ["style"],
  },
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i],
      "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i],
      "text-align": [/^(left|right|center|justify)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https", "http"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tag, attribs) => ({
      tagName: "a",
      attribs: { ...attribs, ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}) },
    }),
  },
};

// Image sources must be our own media route (or https). Relative "/api/media/..." is allowed by default.
export const cleanHtml = (html: string) => sanitizeHtml(html, options);
