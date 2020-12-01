const knex = require("../db/connection");

const products = knex("products");

const getAllProducts = () => products.select("*");

const getProductById = (productId) =>
  products.select("*").where({ product_id: productId }).first();

const getOutOfStockProductsCount = () =>
  products
    .select("product_quantity_in_stock as out_of_stock")
    .count("product_id")
    .where({ product_quantity_in_stock: 0 })
    .groupBy("out_of_stock");

const getMinMaxAveragePricesOfProductsBySupplier = () =>
  products
    .select("supplier_id")
    .min("product_price")
    .max("product_price")
    .avg("product_price")
    .groupBy("supplier_id")
    .orderBy("supplier_id");

const getTotalWeightOfEachProduct = () =>
  products
    .select(
      "product_sku",
      "product_title",
      knex.raw(
        "sum(product_weight_in_lbs * product_quantity_in_stock) as total_weight_in_lbs"
      )
    )
    .groupBy("product_title", "product_sku")
    .orderBy("total_weight_in_lbs");

module.exports = {
  getAllProducts,
  getProductById,
  getOutOfStockProductsCount,
  getMinMaxAveragePricesOfProductsBySupplier,
  getTotalWeightOfEachProduct,
};
