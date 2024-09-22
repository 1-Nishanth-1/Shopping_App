import React, { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

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

    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/registration/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      setMessage("Registration successful!");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (error) {
      setMessage("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container-fluid vh-100 bg-dark d-flex align-items-center justify-content-center">
      <div className="row justify-content-center w-100">
        <div className="col-md-6 bg-secondary bg-gradient p-5 rounded d-flex flex-column align-items-center">
          <Form onSubmit={handleRegister} className="w-100">
            <FloatingLabel
              controlId="floatingUsername"
              label="Username"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="floatingEmail"
              label="Email"
              className="mb-3"
            >
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </FloatingLabel>
            {emailError && <p className="text-danger mt-2">{emailError}</p>}
            <FloatingLabel
              controlId="floatingPassword"
              label="Password"
              className="w-100 mb-3"
            >
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
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
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </FloatingLabel>
            {confirmPasswordError && (
              <p className="text-danger mt-2">{confirmPasswordError}</p>
            )}
            <Button variant="dark" className="mt-3 px-4 py-1" type="submit">
              Register
            </Button>
          </Form>
          <NavLink to="/login" className="text-info mt-3">
            Already have an account?
          </NavLink>
          <h5 className="text-danger mt-3">{message}</h5>
        </div>
      </div>
    </div>
  );
};
