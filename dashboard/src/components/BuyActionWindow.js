import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import API from "../api";
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await API.post("/newOrder", {
        name: uid,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode: "BUY",
      });

      generalContext.closeBuyWindow();
    } catch (err) {
      setError("Unable to place order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    generalContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" data-stock={uid} draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      {error && <p className="loss">{error}</p>}

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <Link to="" className="btn btn-blue" onClick={handleBuyClick}>
            {saving ? "Buying..." : "Buy"}
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
