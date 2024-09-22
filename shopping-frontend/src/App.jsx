import { useState } from "react";
import { NavBar } from "./components/navbar";
import Products from "./components/products";
import { Login } from "./components/login";
import { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Cart } from "./components/Cart";
import { SingleProduct } from "./components/singleProduct";
import { Orders } from "./components/orders";
import { Bill } from "./components/bill";
import { Register } from "./components/Register";
import { Admin } from "./components/admin";
import { ResetPassword } from "./components/resetpassword";
import { NewPassword } from "./components/newpassword";
function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCarousel, setShowCarousel] = useState(true);
  const fetchProduct = () => {
    fetch("http://127.0.0.1:8000/api/product/")
      .then((response) => response.json())
      .then((data) => setProducts(data.data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  return (
    <>
      <BrowserRouter>
        <NavBar
          fetchProduct={fetchProduct}
          products={products}
          setProducts={setProducts}
          showCarousel={showCarousel}
          setShowCarousel={setShowCarousel}
        />
        <Routes>
          <Route
            path="/"
            element={
              <Products
                fetchProduct={fetchProduct}
                products={products}
                cart={cart}
                setCart={setCart}
                showCarousel={showCarousel}
                setShowCarousel={setShowCarousel}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/cart"
            element={<Cart cart={cart} setCart={setCart} />}
          />
          <Route
            path="/product/:id"
            element={<SingleProduct setCart={setCart} />}
          />
          <Route path="/orders" element={<Orders />}></Route>
          <Route path="/bills" element={<Bill />}></Route>
          <Route path="/admin" element={<Admin />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="*" element={<h1>Not Found</h1>} />
          <Route path="/newpassword/:token" element={<NewPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
