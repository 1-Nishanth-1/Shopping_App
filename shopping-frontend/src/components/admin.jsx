import { jwtDecode } from "jwt-decode";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { AddProduct } from "./addProduct";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditProduct } from "./editProduct";
import { Accordion } from "react-bootstrap";
import { AddCategory } from "./addCategory";
import { EditCategory } from "./editCategory";

export const Admin = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeKey, setActiveKey] = useState("0");

  const handleEdit = () => {
    setActiveKey(null);
  };

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    const decodedToken = jwtDecode(accessToken);
    if (!accessToken) {
      navigate("/login");
    } else if (!decodedToken.staff) {
      navigate("/");
    }

    fetch("http://127.0.0.1:8000/api/product/")
      .then((response) => response.json())
      .then((data) => setProducts(data.data))
      .catch((error) => console.error("Error fetching products:", error));

    fetch("http://127.0.0.1:8000/api/category/", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((response) => {
        setCategories(response.data);
        console.log(categories);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3 Tabs"
      fill
    >
      <Tab eventKey="Add Product" title="Add Product">
        <AddProduct categories={categories} setProducts={setProducts} />
      </Tab>
      <Tab eventKey="Edit Product" title="Edit Product">
        <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
          {products &&
            products.map((item) => (
              <Accordion.Item eventKey={item.id.toString()} key={item.id}>
                <Accordion.Header>{item.product_name} </Accordion.Header>
                <Accordion.Body>
                  <EditProduct
                    product={item}
                    categories={categories}
                    onEdit={handleEdit}
                    setProducts={setProducts}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
        </Accordion>
      </Tab>
      <Tab eventKey="Add Category" title="Add Category">
        <AddCategory setCategories={setCategories} />
      </Tab>
      <Tab eventKey="Edit Category" title="Edit Category">
        <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
          {categories &&
            categories.map((item) => (
              <Accordion.Item eventKey={item.id.toString()} key={item.id}>
                <Accordion.Header>{item.category_name} </Accordion.Header>
                <Accordion.Body>
                  <EditCategory
                    setCategories={setCategories}
                    category={item}
                    onEdit={handleEdit}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
        </Accordion>
      </Tab>
    </Tabs>
  );
};
