import React, { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button, Spinner } from "react-bootstrap";
import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom";

export const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();

  const handleNewPassword = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError("");
    setConfirmPasswordError("");
    setLoading(true); // Start loading spinner

    try {
      const response = await fetch("http://127.0.0.1:8000/api/resetpassword/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Password Reset failed");
      }

      setMessage("Password Reset successful!");
      setPassword("");
      setConfirmPassword("");
      navigate("/login"); // Navigate to login page on successful password reset
    } catch (error) {
      setMessage("Password Reset failed. Please try again.");
      console.error("Error during password reset:", error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="container-fluid vh-100 bg-dark d-flex align-items-center justify-content-center">
      <div className="row justify-content-center w-100">
        <div className="col-md-6 bg-secondary bg-gradient p-5 rounded d-flex flex-column align-items-center">
          <Form onSubmit={handleNewPassword} className="w-100">
            <FloatingLabel
              controlId="floatingPassword"
              label="Password"
              className="w-100 mb-3"
            >
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FloatingLabel>
            {passwordError && (
              <p className="text-danger mt-2">{passwordError}</p>
            )}
            <FloatingLabel
              controlId="floatingConfirmPassword"
              label="Confirm Password"
              className="w-100 mb-3"
            >
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FloatingLabel>
            {confirmPasswordError && (
              <p className="text-danger mt-2">{confirmPasswordError}</p>
            )}
            <Button variant="dark" className="mt-3 px-4 py-1" type="submit">
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              ) : null}
              {loading ? "Loading..." : "Reset Password"}
            </Button>
          </Form>
          {location.pathname !== "/newpassword" && (
            <NavLink to="/login" className="text-info mt-3">
              Already have an account?
            </NavLink>
          )}
          <h5 className="text-danger mt-3">{message}</h5>
        </div>
      </div>
    </div>
  );
};
