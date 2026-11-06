import type { Access, CollectionConfig } from "payload"

const isSelf: Access = ({ id, req }) =>
  req.user?.collection === "users" && String(req.user.id) === String(id)

const isAdminOrSelf: Access = (args) =>
  args.req.user?.collection === "admins" || isSelf(args)

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    defaultColumns: ["email", "createdAt"],
    useAsTitle: "email",
  },
  access: {
    create: () => true,
    delete: isSelf,
    read: isAdminOrSelf,
    update: isSelf,
  },
  fields: [],
}
