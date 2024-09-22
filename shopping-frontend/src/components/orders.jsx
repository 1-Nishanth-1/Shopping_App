import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  let date = "";
  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    if (!accessToken) {
      navigate("/login");
    }
    fetch("http://127.0.0.1:8000/api/orders/", {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.msg === "success") {
          setOrders(response.data);
        }
      });
  }, [navigate]);

  return (
    <div className="orders-container">
      {orders.map((item) => (
        <div
          key={item.id}
          className="order-item row align-items-center p-md-3 my-3 border rounded"
        >
          {item.date_created.split("T")[0] !== date && (
            <div className="col-12">
              <h3 className="order-date">
                {(date = item.date_created.split("T")[0])}
              </h3>
              <hr />
            </div>
          )}
          <div className="col-md-2 col-3">
            <img
              src={`http://127.0.0.1:8000/${item.orders_product.product_image}`}
              alt={item.orders_product.product_name}
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-4 col-3">
            <h4>{item.orders_product.product_name}</h4>
          </div>
          <div className="col-2">
            <h4>${item.orders_product.product_price}</h4>
          </div>
          <div className="col-2 text-center">
            <h4>{item.product_nos}</h4>
          </div>
          <div className="col-2">
            <h4>${item.orders_product.product_price * item.product_nos}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};
