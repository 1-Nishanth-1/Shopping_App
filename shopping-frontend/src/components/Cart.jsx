import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";

export const Cart = ({ cart = [], setCart }) => {
  const navigate = useNavigate();
  const [totPrice, setTotPrice] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    if (!accessToken) {
      navigate("/login");
    } else {
      fetch("http://127.0.0.1:8000/api/cart/", {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((response) => {
          if (response.msg === "success") {
            setCart(response.data || []);
            setTotPrice(response.sum || 0);
            setCount(response.count || 0);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch cart data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [navigate, setCart]);

  const addItem = (item) => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return;
    }

    fetch("http://127.0.0.1:8000/api/cart/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: item.id,
        product_nos: item.product_nos + 1,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setCart((prevCart) =>
          prevCart.map((it) =>
            it.id === item.id
              ? { ...it, product_nos: item.product_nos + 1 }
              : it
          )
        );
        setTotPrice(
          (prevTotPrice) => prevTotPrice + item.cart_product.product_price
        );
      })
      .catch((error) => {
        console.error("Failed to update item:", error);
      });
  };

  const subItem = (item) => {
    if (item.product_nos > 1) {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

      if (!accessToken) {
        console.error("No access token found. Please log in.");
        return;
      }

      fetch("http://127.0.0.1:8000/api/cart/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: item.id,
          product_nos: item.product_nos - 1,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          setCart((prevCart) =>
            prevCart.map((it) =>
              it.id === item.id
                ? { ...it, product_nos: item.product_nos - 1 }
                : it
            )
          );
          setTotPrice(
            (prevTotPrice) => prevTotPrice - item.cart_product.product_price
          );
        })
        .catch((error) => {
          console.error("Failed to update item:", error);
        });
    }
  };

  const deleteItem = (item) => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return;
    }

    fetch("http://127.0.0.1:8000/api/cart/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: item.id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setCart((prevCart) => prevCart.filter((it) => it.id !== item.id));
        setTotPrice(
          (prevTotPrice) =>
            prevTotPrice - item.cart_product.product_price * item.product_nos
        );
      })
      .catch((error) => {
        console.error("Failed to delete item:", error);
      });
  };

  const placeOrder = async () => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generatebill/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate bill");
      }

      // const pdfBlob = await response.blob();
      // const pdfUrl = window.URL.createObjectURL(pdfBlob);
      // const link = document.createElement("a");
      // link.href = pdfUrl;
      // link.setAttribute("download", "bill.pdf");
      // document.body.appendChild(link);
      // link.click();
      // link.parentNode.removeChild(link);
      const pdfBlob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      await Promise.all(
        cart.map((item) =>
          fetch("http://127.0.0.1:8000/api/orders/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              orders_product: item.cart_product.id,
              product_nos: item.product_nos,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              console.log("Product added to order successfully:", data);
            })
            .then(() => deleteItem(item))
        )
      );

      setCart([]);
      setTotPrice(0);
      setCount(0);

      navigate("/");
    } catch (error) {
      console.error("Error placing order or generating bill:", error);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      {cart.length !== 0 ? (
        <>
          <h2>Count: {count}</h2>
          <div className="container-fluid "></div>
          {cart.map((item) => {
            const productImage = item.cart_product?.product_image;
            const productName = item.cart_product?.product_name;
            const productPrice = item.cart_product?.product_price;

            return (
              <div key={item.id} className="row cartItems m-0 p-4 border">
                {productImage && (
                  <img
                    src={`http://127.0.0.1:8000/${productImage}`}
                    alt={productName}
                    className="col-2 cartImage"
                  />
                )}
                <h3 className="col-5">{productName}</h3>
                <h3 className="col-1">${productPrice}</h3>
                <div className="col-2">
                  <h3>
                    <Button
                      variant="outline-dark px-2 py-1 m-1"
                      onClick={() => addItem(item)}
                    >
                      <IoMdAdd />
                    </Button>
                    {item.product_nos}
                    <Button
                      variant="outline-dark px-2 py-1 m-1"
                      onClick={() => subItem(item)}
                    >
                      <RiSubtractFill />
                    </Button>
                  </h3>
                  <Button
                    variant="outline-danger px-2 py-1 m-1"
                    onClick={() => deleteItem(item)}
                  >
                    <MdDelete />
                  </Button>
                </div>
                <h3 className="col-2">${productPrice * item.product_nos}</h3>
              </div>
            );
          })}
          <h2 align="right" className="m-5 px-5">
            Total: ${totPrice}
          </h2>
          <Button
            variant="success"
            className="place-order"
            onClick={() => placeOrder()}
          >
            Place Order
          </Button>
        </>
      ) : (
        <img
          src=".\public\images\Daco_5212497.png"
          className="cart-empty"
        ></img>
      )}
    </>
  );
};
