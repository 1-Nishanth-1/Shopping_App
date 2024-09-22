import React, { useEffect, useState } from "react";
import { Button, Card, Spinner, Modal, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IoStar, IoStarHalf } from "react-icons/io5";

const Products = ({
  fetchProduct,
  products,
  cart,
  setCart,
  setShowCarousel,
  showCarousel,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProduct();
    setShowCarousel(true);
  }, []);

  const AddToCart = (item) => {
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
        cart_product: item.id,
        product_nos: 1,
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
        setCart((prevCart) => [...prevCart, data]); // Update the cart state
      })
      .catch((error) => {
        console.error("Error adding product to cart:", error);
      });
  };

  return products.length ? (
    <>
      <div className="container-fluid m-0 p-0">
        <div className="row justify-content-evenly p-0 m-0">
          {showCarousel && (
            <div className="carousel p-0">
              <Carousel>
                {products.map((item) => (
                  <Carousel.Item
                    key={item.id}
                    onClick={() =>
                      localStorage.getItem("AccessToken")
                        ? navigate(`/product/${item.id}`)
                        : setShowModal(true)
                    }
                  >
                    <img
                      width="100%"
                      className="image-cara"
                      alt=""
                      src={`http://127.0.0.1:8000/${item.product_image}`}
                    />
                    <Carousel.Caption>
                      <div className="carousel-text">
                        <h3>{item.product_name}</h3>

                        <p>${item.product_price}</p>
                      </div>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          )}
          {products.map((item) => (
            <Card
              key={item.id}
              className="col-lg-2 col-sm-3 col-5 border p-2 productCard"
            >
              <Card.Img
                onClick={() =>
                  localStorage.getItem("AccessToken")
                    ? navigate(`/product/${item.id}`)
                    : setShowModal(true)
                }
                variant="top"
                src={`http://127.0.0.1:8000/${item.product_image}`}
                alt={item.product_name} // Provide alt text for accessibility
              />
              <Card.Body onClick={() => navigate(`/product/${item.id}`)}>
                <Card.Title>{item.product_name}</Card.Title>
                <div className="">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <React.Fragment key={star}>
                      {item.Rating - star <= 0.75 &&
                      item.Rating - star >= 0.25 ? (
                        <IoStarHalf key={star} className="rating" />
                      ) : (
                        <IoStar
                          key={star}
                          className={
                            star + 0.75 <= item.Rating ? "rating" : "noRating"
                          }
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <Card.Text>${item.product_price}</Card.Text>

                <Card.Text>{item.product_category.category_name}</Card.Text>
              </Card.Body>
              <Card.Footer>
                <Button variant="success" onClick={() => AddToCart(item)}>
                  Add To Cart
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Authentication Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>Please log in to add products to the cart.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Log In
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  ) : (
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
};

export default Products;
