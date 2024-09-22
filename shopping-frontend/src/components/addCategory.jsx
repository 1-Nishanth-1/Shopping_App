import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

export const AddCategory = ({ setCategories }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!name) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

      const formData = new FormData();
      formData.append("category_name", name);

      const response = await fetch("http://127.0.0.1:8000/api/category/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setCategories((prev) => [...prev, data.data]);
        });

      setName("");
    } catch (error) {
      console.error("Error adding Category:", error);
      setError("Failed to add Category. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="addProduct">
      <h2>Add Category</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Name:</Form.Label>
          <Form.Control
            value={name}
            onChange={handleNameChange}
            isInvalid={!!error}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Category"}
        </Button>
      </Form>
    </div>
  );
};
