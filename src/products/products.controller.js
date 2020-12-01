const ProductsService = require("./products.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function productExists(req, res, next) {
  const error = { status: 404, message: `Product cannot be found.` };

  const { productId } = req.params;
  if (!productId) return next(error);

  const product = await ProductsService.getProductById(productId);

  if (!product) return next(error);
  res.locals.product = product;
  next();
}

function queryParametersAreValid(req, res, next) {
  const validQueryParameters = {
    get_out_of_stock_count: ["1"],
    get_prices_summary_stats: ["1"],
    get_total_weight: ["1"],
  };

  for (const [key, value] of Object.entries(req.query)) {
    if (
      !validQueryParameters[key] ||
      !validQueryParameters[key].includes(value)
    ) {
      return next({
        status: 400,
        message: `${key}=${value} is not a valid query parameter.`,
      });
    }
  }

  const {
    get_out_of_stock_count: getOutOfStockCount = "",
    get_prices_summary_stats: getPricesSummaryStats = "",
    get_total_weight: getTotalWeight = "",
  } = req.query;

  res.locals.query = {
    getOutOfStockCount,
    getPricesSummaryStats,
    getTotalWeight,
  };

  next();
}

function read(req, res, next) {
  const { product } = res.locals;
  res.json({ data: product });
}

async function list(req, res, next) {
  const { query } = res.locals;
  const { getOutOfStockCount, getPricesSummaryStats, getTotalWeight } = query;

  let products;

  // /products
  if (!getOutOfStockCount && !getPricesSummaryStats && !getTotalWeight) {
    products = await ProductsService.getAllProducts();
  }
  // /products?get_out_of_stock_count=1
  if (getOutOfStockCount === "1") {
    products = await ProductsService.getOutOfStockProductsCount();
  }

  // /products?get_prices_summary_stats=1
  if (getPricesSummaryStats === "1") {
    products = await ProductsService.getMinMaxAveragePricesOfProductsBySupplier();
  }

  // /products?get_total_weight=1
  if (getTotalWeight === "1") {
    products = await ProductsService.getTotalWeightOfEachProduct();
  }
  res.json({ data: products });
}

module.exports = {
  read: [asyncErrorBoundary(productExists), asyncErrorBoundary(read)],
  list: asyncErrorBoundary(list),
};
