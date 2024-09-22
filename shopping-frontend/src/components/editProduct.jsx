import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { Modal } from "react-bootstrap";

export const EditProduct = ({ product, categories, onEdit, setProducts }) => {
  const [price, setPrice] = useState(product.product_price);
  const [details, setDetails] = useState(product.product_desc || "");
  const [name, setName] = useState(product.product_name);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(
    product.product_category
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleDelete = async () => {
    try {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
      const response = await fetch("http://127.0.0.1:8000/api/product/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: product.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setConfirm(false);
      onEdit();
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

      const formData = new FormData();
      formData.append("product_price", price);
      formData.append("product_desc", details);
      formData.append("product_name", name);
      formData.append("product_category", selectedCategory);
      if (e.target.elements.image.files[0]) {
        formData.append("product_image", e.target.elements.image.files[0]);
      }
      formData.append("id", product.id);

      const response = await fetch("http://127.0.0.1:8000/api/product/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to edit product");
      }

      const updatedProduct = await response.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updatedProduct.data : p))
      );

      onEdit(); // Collapse the accordion after successful edit
      navigate("/admin");
    } catch (error) {
      console.error("Error editing product:", error);
      setError("Failed to edit product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addProduct">
      <h2>
        Edit Product{" "}
        <Button variant="danger" onClick={() => setConfirm(true)}>
          <MdDelete />
        </Button>
        <Modal show={confirm} onHide={() => setConfirm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete {product.product_name}?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Close
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Name:</Form.Label>
          <Form.Control type="text" value={name} onChange={handleNameChange} />
        </Form.Group>
        <Form.Group controlId="price">
          <Form.Label>Price:</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={handlePriceChange}
          />
        </Form.Group>
        <Form.Group controlId="details">
          <Form.Label>Product Details:</Form.Label>
          <Form.Control
            as="textarea"
            value={details}
            onChange={handleDetailsChange}
          />
        </Form.Group>
        <Form.Group controlId="category">
          <Form.Label>Category:</Form.Label>
          <Form.Control
            as="select"
            value={selectedCategory}
            onChange={handleCategoryChange}
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
          <Form.Control type="file" name="image" />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Editing..." : "Edit Product"}
        </Button>
      </Form>
    </div>
  );
};
