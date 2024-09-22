import React, { useState } from "react";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";

export const EditCategory = ({ setCategories, category, onEdit }) => {
  const [name, setName] = useState(category.category_name);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleDelete = async () => {
    try {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
      const response = await fetch(`http://127.0.0.1:8000/api/category/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: category.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories((prev) => prev.filter((p) => p.id !== category.id));
      setConfirm(false);
      onEdit();
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

      const formData = new FormData();
      formData.append("category_name", name);
      formData.append("id", category.id);

      const response = await fetch(`http://127.0.0.1:8000/api/category/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to edit category");
      }

      const updatedCategory = await response.json();
      setCategories((prev) =>
        prev.map((cat) => (cat.id === category.id ? updatedCategory.data : cat))
      );

      onEdit();
      navigate("/admin");
    } catch (error) {
      console.error("Error editing category:", error);
      setError("Failed to edit category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editCategory">
      <h2>
        Edit Category{" "}
        <Button variant="danger" onClick={() => setConfirm(true)}>
          <MdDelete />
        </Button>
        <Modal show={confirm} onHide={() => setConfirm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete {category.category_name} category?
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
          <Form.Control value={name} onChange={handleNameChange} />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Editing..." : "Edit Category"}
        </Button>
      </Form>
    </div>
  );
};
