-- CreateTable
CREATE TABLE "RecipeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "supplyId" TEXT NOT NULL,
    "quantityPerBatch" REAL NOT NULL,
    CONSTRAINT "RecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeItem_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "categoryId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "costPerBatch" REAL NOT NULL DEFAULT 0,
    "costPerUnit" REAL NOT NULL DEFAULT 0,
    "maxProduction" INTEGER NOT NULL DEFAULT 0,
    "limitingIngredient" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "categoryId", "createdAt", "description", "id", "name", "price", "updatedAt") SELECT "active", "categoryId", "createdAt", "description", "id", "name", "price", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Supply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "costPerUnit" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Supply" ("active", "createdAt", "id", "minStock", "name", "quantity", "unit", "updatedAt") SELECT "active", "createdAt", "id", "minStock", "name", "quantity", "unit", "updatedAt" FROM "Supply";
DROP TABLE "Supply";
ALTER TABLE "new_Supply" RENAME TO "Supply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RecipeItem_productId_supplyId_key" ON "RecipeItem"("productId", "supplyId");
