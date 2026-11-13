// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "master";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "images/uploads"
    }
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "content/blog",
        format: "json",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              const raw = values?.slug || values?.title || "";
              const slug = raw.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              return slug || "post";
            }
          }
        },
        defaultItem: () => ({
          author: "Zyxen Team",
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          published: true,
          featured: false,
          category: "Website Design"
        }),
        fields: [
          {
            type: "string",
            name: "postId",
            nameOverride: "id",
            label: "ID",
            description: "Optional custom ID"
          },
          {
            type: "string",
            name: "slug",
            label: "Slug",
            required: true,
            ui: {
              validate: (val) => {
                if (!val) return "Slug is required";
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val)) {
                  return "Slug must be lowercase alphanumeric with hyphens (e.g. my-post-slug)";
                }
              }
            }
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "content",
            label: "Content",
            isBody: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "author",
            label: "Author"
          },
          {
            type: "string",
            name: "date",
            label: "Date",
            required: true,
            description: "Format: YYYY-MM-DD",
            ui: {
              validate: (val) => {
                if (!val) return "Date is required";
                if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                  return "Date must be in YYYY-MM-DD format";
                }
              }
            }
          },
          {
            type: "string",
            name: "readTime",
            label: "Read Time"
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: [
              "Website Design",
              "Production Management",
              "AI Engineering",
              "High-Performance Web",
              "Modern Cloud Architecture",
              "System Design",
              "Aviation Academy",
              "Exam Portals"
            ]
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured"
          },
          {
            type: "boolean",
            name: "published",
            label: "Published",
            description: "True to make post public, false/omitted for draft."
          },
          {
            type: "image",
            name: "coverImage",
            label: "Cover Image"
          },
          {
            type: "string",
            name: "image",
            label: "Image",
            description: "Legacy image path or alternate URL."
          },
          {
            type: "string",
            name: "updatedDate",
            label: "Updated Date",
            description: "Optional format: YYYY-MM-DD"
          },
          {
            type: "string",
            name: "coverImageAlt",
            label: "Cover Image Alt Text"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
