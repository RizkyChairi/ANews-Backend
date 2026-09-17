import { mysqlTable, serial, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});