import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingOrderId, setEditingOrderId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    qty: "",
    price: "",
    mode: "BUY",
  });

  const fetchOrders = async () => {
    try {
      const response = await API.get("/allOrders");
      setOrders(response.data.data);
    } catch (err) {
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditClick = (order) => {
    setEditingOrderId(order._id);
    setEditForm({
      name: order.name,
      qty: order.qty,
      price: order.price,
      mode: order.mode,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleUpdateClick = async (orderId) => {
    try {
      const response = await API.put(`/orders/${orderId}`, {
        name: editForm.name,
        qty: Number(editForm.qty),
        price: Number(editForm.price),
        mode: editForm.mode,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? response.data.data : order
        )
      );
      setEditingOrderId("");
      setError("");
    } catch (err) {
      setError("Unable to update order. Please try again.");
    }
  };

  const handleDeleteClick = async (orderId) => {
    try {
      await API.delete(`/orders/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
      setError("");
    } catch (err) {
      setError("Unable to delete order. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId("");
  };

  if (loading) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p className="loss">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders today</p>

          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <h3 className="title">Orders ({orders.length})</h3>
      {error && <p className="loss">{error}</p>}

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Mode</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const isEditing = editingOrderId === order._id;

              return (
                <tr key={order._id}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                      />
                    ) : (
                      order.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        name="qty"
                        value={editForm.qty}
                        onChange={handleEditChange}
                      />
                    ) : (
                      order.qty
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        name="price"
                        step="0.05"
                        value={editForm.price}
                        onChange={handleEditChange}
                      />
                    ) : (
                      order.price.toFixed(2)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        name="mode"
                        value={editForm.mode}
                        onChange={handleEditChange}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    ) : (
                      order.mode
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          className="btn"
                          onClick={() => handleUpdateClick(order._id)}
                        >
                          Save
                        </button>
                        <button className="btn" onClick={handleCancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn"
                          onClick={() => handleEditClick(order)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleDeleteClick(order._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
