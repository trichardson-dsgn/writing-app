import type { Access, CollectionConfig } from "payload"

const isAdmin = (req: Parameters<Access>[0]["req"]) =>
  req.user?.collection === "admins"

const ownerAccess: Access = ({ req }) => {
  if (isAdmin(req)) return true

  if (req.user?.collection === "users") {
    return {
      owner: {
        equals: req.user.id,
      },
    }
  }

  return false
}

export const Documents: CollectionConfig = {
  slug: "documents",
  access: {
    create: ({ req }) => isAdmin(req) || req.user?.collection === "users",
    delete: ownerAccess,
    read: ownerAccess,
    update: ownerAccess,
  },
  admin: {
    defaultColumns: ["title", "updatedAt"],
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      maxLength: 300,
    },
    {
      name: "content",
      type: "textarea",
      maxLength: 100_000,
    },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      index: true,
      admin: {
        position: "sidebar",
      },
      access: {
        create: ({ req }) => isAdmin(req) || req.user?.collection === "users",
        update: ({ req }) => isAdmin(req),
      },
    },
    {
      name: "workspaceId",
      type: "text",
      index: true,
      admin: {
        hidden: true,
      },
      access: {
        create: ({ req }) =>
          isAdmin(req) ||
          (typeof req.context.workspaceId === "string" &&
            Boolean(req.context.workspaceId)),
        read: ({ req }) => isAdmin(req),
        update: ({ req }) => isAdmin(req),
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data

        if (req.user?.collection === "users") {
          return {
            ...data,
            owner: req.user.id,
          }
        }

        return data
      },
    ],
  },
}
