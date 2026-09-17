// config/schema.ts
import { mysqlTable, mysqlEnum, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const USER_ROLES = ["user", "admin"] as const;
export const POST_STATUS = ["delete", "published"] as const;

// USERS
export const usersTable = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", USER_ROLES).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// POSTS
export const postsTable = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  categoryId: int("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  status: mysqlEnum("status", POST_STATUS).notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// CATEGORIES
export const categoriesTable = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  posts: many(postsTable),
}));

export const postsRelations = relations(postsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [postsTable.categoryId],
    references: [categoriesTable.id],
  }),
}));