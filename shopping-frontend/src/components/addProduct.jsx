import React, { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const AddProduct = ({ categories, setProducts }) => {
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // Changed to string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlePriceChange = (e) => {
    const { value } = e.target;
    if (value < 0) {
      setError("Price cannot be negative");
    } else {
      setError(null);
      setPrice(value);
    }
  };

  const handleDetailsChange = (e) => {
    setDetails(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!price || price < 0 || !details || !name || !selectedCategory) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

      // Get the selected category ID
      const categoryId = selectedCategory;

      const formData = new FormData();
      formData.append("product_price", price);
      formData.append("product_desc", details);
      formData.append("product_name", name);
      formData.append("product_category", categoryId); // Use category ID here
      formData.append("product_image", e.target.elements.image.files[0]);

      const response = await fetch("http://127.0.0.1:8000/api/product/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setProducts((prev) => [...prev, data.data]);
        });

      setPrice("");
      setDetails("");
      setName("");
      setSelectedCategory("");
      setImage(null);
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="addProduct">
      <h2>Add Product</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Name:</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={handleNameChange}
            isInvalid={!!error}
          />
        </Form.Group>
        <Form.Group controlId="price">
          <Form.Label>Price:</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={handlePriceChange}
            isInvalid={!!error}
          />
        </Form.Group>
        <Form.Group controlId="details">
          <Form.Label>Product Details:</Form.Label>
          <Form.Control
            as="textarea"
            value={details}
            isInvalid={!!error}
            onChange={handleDetailsChange}
          />
        </Form.Group>

        <Form.Group controlId="category">
          <Form.Label>Category:</Form.Label>
          <Form.Control
            as="select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            isInvalid={!!error}
          >
            <option value="">Select a category</option>
            {categories &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="image">
          <Form.Label>Product Image:</Form.Label>
          <Form.Control type="file" isInvalid={!!error} name="image" />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </Form>
    </div>
  );
};
