const { model } = require("mongoose");

const { OrdersSchema } = require("../schemas/OrdersSchema");

const OrdersModel = model("Order", OrdersSchema);

module.exports = { OrdersModel };
