import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Reviews from "./reviews";
import { IoStar, IoStarHalf } from "react-icons/io5";
import { Button } from "react-bootstrap";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";

export const SingleProduct = ({ setCart }) => {
  const [singleProduct, setSingleProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  let { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/product/?id=${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }
        const data = await response.json();
        setSingleProduct(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!singleProduct) {
    return null;
  }

  const { product_image, product_name, Rating, product_price, product_desc } =
    singleProduct;

  const addToCart = () => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

    if (!accessToken) {
      setShowModal(true);
      return;
    }

    fetch("http://127.0.0.1:8000/api/cart/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cart_product: singleProduct.id,
        product_nos: count,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Product added to cart successfully:", data);
        setCart((prevCart) => [...prevCart, data]);
        setCount(1);
      })
      .catch((error) => {
        console.error("Error adding product to cart:", error);
      });
  };

  return (
    <div className="container-fluid">
      <div className="row details p-0 m-0">
        <img
          src={`http://127.0.0.1:8000/${product_image}`}
          alt={product_name}
          className="col-md-5 col-11 my-2"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "path/to/default/image.jpg";
          }}
        />
        <div className="col-md-5 col-11">
          <h1>{product_name}</h1>
          <div className="">
            {[0, 1, 2, 3, 4].map((star) => (
              <React.Fragment key={star}>
                {Rating - star <= 0.75 && Rating - star >= 0.25 ? (
                  <IoStarHalf key={star} className="rating" />
                ) : (
                  <IoStar
                    key={star}
                    className={star + 0.75 <= Rating ? "rating" : "noRating"}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <h3>${product_price}</h3>
          <p>
            {showFullDesc ? product_desc : `${product_desc.slice(0, 400)}...`}
            {product_desc.length > 400 && (
              <span
                onClick={() => setShowFullDesc(!showFullDesc)}
                style={{ color: "blue", cursor: "pointer" }}
              >
                {showFullDesc ? " Read Less" : " Read More"}
              </span>
            )}
          </p>
        </div>
        <div className="col-md-1 col-12 addtocart" id="addtocart">
          <Button
            variant="outline-danger px-md-1 px-4 py-1 m-1"
            onClick={() => setCount(count + 1)}
          >
            <IoMdAdd />
          </Button>
          <input
            type="number"
            className="form-control"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <Button
            variant="outline-primary px-md-1 px-4 py-1 m-1"
            onClick={() => {
              if (count > 1) {
                setCount(count - 1);
              }
            }}
          >
            <RiSubtractFill />
          </Button>
          <Button className="btn btn-primary p-1" onClick={addToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-md-5 mx-md-5">
        <Reviews product={singleProduct} />
      </div>
    </div>
  );
};
