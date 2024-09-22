import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const NavBar = ({
  fetchProduct,
  products,
  setProducts,
  showCarousel,
  setShowCarousel,
}) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1000);
  const [decodedToken, setDecodedToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const updateTokens = () => {
    const refreshToken = localStorage.getItem("RefreshToken");
    if (refreshToken) {
      fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh: JSON.parse(refreshToken) }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }
          return response.json();
        })
        .then((response) => {
          if (!response.access) {
            navigate("/login");
            window.alert("Please Login Again");
          } else {
            localStorage.setItem(
              "AccessToken",
              JSON.stringify(response.access)
            );
            const decoded = jwtDecode(response.access);
            setDecodedToken(decoded);
            localStorage.setItem(
              "RefreshToken",
              JSON.stringify(response.refresh)
            );
          }
        })
        .catch((error) => {
          console.error("Error refreshing token:", error);
          navigate("/login");
          window.alert("An error occurred. Please login again.");
        });
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("AccessToken");
    const publicPaths = ["/register", "/resetpassword", "/login", "/"];
    const isNewPasswordPath = location.pathname.startsWith("/newpassword/");

    if (
      !accessToken &&
      !publicPaths.includes(location.pathname) &&
      !isNewPasswordPath
    ) {
      navigate("/login");
    } else if (
      accessToken &&
      (location.pathname === "/register" ||
        location.pathname === "/resetpassword" ||
        location.pathname === "/login" ||
        isNewPasswordPath)
    ) {
      navigate("/");
    } else {
      updateTokens();
      const intervalId = setInterval(updateTokens, 15 * 60000);
      return () => clearInterval(intervalId);
    }
  }, [navigate, location.pathname]);

  const productsFilter = (e) => {
    e.preventDefault();
    const name = e.currentTarget.elements?.search.value || "";
    fetch(
      `http://127.0.0.1:8000/api/product/?name=${name}&max_price=${maxValue}&min_price=${minValue}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.data);
        setShowCarousel(false);
      })
      .catch((error) => console.error("Error fetching products:", error));
    if (show) {
      toggleShow();
    }
  };

  const changeMaxVal = (e) => {
    const value = parseInt(e.target.value);
    if (value >= minValue) {
      setMaxValue(value);
    }
  };

  const changeMinVal = (e) => {
    const value = parseInt(e.target.value);
    if (value <= maxValue) {
      setMinValue(value);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    const name = e.currentTarget.elements?.search.value || "";
    fetch(`http://127.0.0.1:8000/api/product/?name=${name}`)
      .then((response) => response.json())
      .then((data) => setProducts(data.data))
      .catch((error) => console.error("Error fetching products:", error));
    toggleShow();
  };

  const logout = () => {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("RefreshToken");
    navigate("/login");
  };

  return (
    <>
      <Navbar
        expand="lg"
        bg="dark"
        variant="dark"
        className="navbar"
        sticky="top"
      >
        <Container fluid className="px-2">
          <Navbar.Brand as={NavLink} to="/">
            SHOPPYY
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            >
              {localStorage.getItem("AccessToken") ? (
                <>
                  <Nav.Link as={NavLink} to="/cart">
                    Cart
                  </Nav.Link>
                  <NavDropdown title="Link" id="navbarScrollingDropdown">
                    <NavDropdown.Item as={NavLink} to="/orders">
                      Orders
                    </NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/bills">
                      Bills
                    </NavDropdown.Item>
                    {decodedToken && decodedToken.staff && (
                      <>
                        <NavDropdown.Divider />
                        <NavDropdown.Item as={NavLink} to="/admin">
                          Admin
                        </NavDropdown.Item>
                      </>
                    )}
                  </NavDropdown>
                  <Nav.Link onClick={logout}>Logout</Nav.Link>
                </>
              ) : (
                location.pathname !== "/login" && (
                  <Nav.Link as={NavLink} to="/login">
                    Login
                  </Nav.Link>
                )
              )}
              {location.pathname === "/" && (
                <>
                  <Button
                    variant="outline-danger"
                    onClick={toggleShow}
                    className="me-2"
                  >
                    Filter
                  </Button>
                  <Offcanvas
                    show={show}
                    onHide={handleClose}
                    scroll="true"
                    backdrop="true"
                  >
                    <Offcanvas.Header closeButton>
                      <Offcanvas.Title>Filter</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                      <Form.Label>Min Value: {minValue}</Form.Label>
                      <Form.Range
                        value={minValue}
                        max={1000}
                        onChange={changeMinVal}
                      />
                      <Form.Label>Max Value: {maxValue}</Form.Label>
                      <Form.Range
                        max={1000}
                        value={maxValue}
                        onChange={changeMaxVal}
                      />
                      <Button
                        onClick={productsFilter}
                        variant="outline-success"
                      >
                        Submit
                      </Button>
                      <Button onClick={reset} variant="outline-danger">
                        Reset
                      </Button>
                    </Offcanvas.Body>
                  </Offcanvas>
                </>
              )}
            </Nav>
            {location.pathname === "/" && (
              <Form className="d-flex" onSubmit={productsFilter}>
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  name="search"
                  defaultValue=""
                />
                <Button variant="outline-success" type="submit">
                  Search
                </Button>
              </Form>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};
