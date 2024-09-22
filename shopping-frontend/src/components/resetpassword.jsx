import React, { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button, Spinner } from "react-bootstrap"; // Import Spinner from react-bootstrap
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

export const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const tryLogin = (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!email) {
      setMessage("Please enter email");
      return;
    }

    setLoading(true); // Set loading to true when starting fetch

    fetch("http://127.0.0.1:8000/api/resetpassword/", {
      method: "POST",
      body: JSON.stringify({
        email: email,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        setLoading(false); // Set loading to false when fetch completes
        if (!response.ok) {
          // Handle non-200 responses
          return response.json().then((error) => {
            throw new Error(error.msg || "Failed to authenticate");
          });
        }
        return response.json();
      })
      .then((response) => {
        // Handle successful response
        setMessage("Password reset email sent successfully!");
      })
      .catch((error) => {
        setLoading(false); // Set loading to false on error
        console.error("Error during login:", error);
        setMessage(error.message || "Invalid Email or Email Not Verified");
      });
  };

  return (
    <div className="container-fluid vh-100 bg-dark d-flex align-items-center justify-content-center">
      <div className="row justify-content-center w-100">
        <Form
          className="col-md-6 bg-secondary bg-gradient p-5 rounded d-flex flex-column align-items-center"
          onSubmit={tryLogin}
        >
          <FloatingLabel
            controlId="floatingInput"
            label="Email"
            className="mb-3 w-100"
          >
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FloatingLabel>
          <Button
            variant="dark"
            className="mt-3 px-4 py-1"
            type="submit"
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Confirm"}
          </Button>
          <NavLink to="/register" className="text-info mt-3">
            Create new Account?
          </NavLink>
          <NavLink to="/login" className="text-info mt-3">
            Back to login
          </NavLink>
          <h5 className="text-danger mt-3">{message}</h5>
        </Form>
      </div>
    </div>
  );
};
