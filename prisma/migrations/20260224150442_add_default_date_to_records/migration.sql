-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NutritionalRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "NutritionalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NutritionalRecord" ("calories", "createdAt", "date", "description", "id", "updatedAt", "userId") SELECT "calories", "createdAt", "date", "description", "id", "updatedAt", "userId" FROM "NutritionalRecord";
DROP TABLE "NutritionalRecord";
ALTER TABLE "new_NutritionalRecord" RENAME TO "NutritionalRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
