import { prisma } from "@/lib/db";

/**
 * Recalculate maxProduction, costPerBatch, costPerUnit, limitingIngredient
 * for a product based on its recipe and current supply levels.
 */
export async function recalcProductCosts(productId: string) {
  const recipeItems = await prisma.recipeItem.findMany({
    where: { productId },
    include: { supply: true },
  });

  if (recipeItems.length === 0) return;

  let costPerBatch = 0;
  let maxProduction = Infinity;
  let limitingIngredient: string | null = null;

  for (const ri of recipeItems) {
    const supply = ri.supply;

    // Cost contribution per batch
    if (supply.unit === "unidades") {
      costPerBatch += supply.costPerUnit * ri.quantityPerBatch;
    } else {
      // quantityPerBatch in grams, costPerUnit in R$/kg
      costPerBatch += (ri.quantityPerBatch / 1000) * supply.costPerUnit;
    }

    // Max batches from this supply
    let availableInRecipeUnit = supply.quantity;
    if (supply.unit === "kg") {
      availableInRecipeUnit = supply.quantity * 1000; // to grams
    }
    const batchesFromSupply = Math.floor(availableInRecipeUnit / ri.quantityPerBatch);
    const unitsFromSupply = batchesFromSupply * 10; // 10 units per batch

    if (unitsFromSupply < maxProduction) {
      maxProduction = unitsFromSupply;
      limitingIngredient = supply.name;
    }
  }

  if (maxProduction === Infinity) maxProduction = 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      costPerBatch: Math.round(costPerBatch * 100) / 100,
      costPerUnit: Math.round((costPerBatch / 10) * 100) / 100,
      maxProduction,
      limitingIngredient,
    },
  });
}

/**
 * Recalculate costs for ALL products that use a given supply.
 */
export async function recalcProductsUsingSupply(supplyId: string) {
  const recipeItems = await prisma.recipeItem.findMany({
    where: { supplyId },
    select: { productId: true },
  });

  const productIds = [...new Set(recipeItems.map((ri) => ri.productId))];
  for (const productId of productIds) {
    await recalcProductCosts(productId);
  }
}
