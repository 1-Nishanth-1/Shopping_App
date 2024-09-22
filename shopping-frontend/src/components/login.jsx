import React, { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();

  const tryLogin = (e) => {
    setLoading(true); // Set loading to true when starting fetch
    e.preventDefault(); // Prevent default form submission

    if (!username || !password) {
      setMessage("Please enter both username and password.");
      setLoading(false); // Set loading to false on error
      return;
    }

    fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          console.log(JSON.stringify(response));
          throw new Error("Failed to authenticate");
        }
        return response.json();
      })
      .then((response) => {
        localStorage.setItem("AccessToken", JSON.stringify(response.access));
        localStorage.setItem("RefreshToken", JSON.stringify(response.refresh));
        navigate("/");
        setLoading(false); // Set loading to false when fetch completes
      })
      .catch((error) => {
        console.error("Error during login:", error);
        setMessage("Invalid username or password or Email Not Verified");
        setLoading(false); // Set loading to false on error
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
            label="Username"
            className="mb-3 w-100"
          >
            <Form.Control
              type="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FloatingLabel>
          <FloatingLabel
            controlId="floatingPassword"
            label="Password"
            className="w-100"
          >
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FloatingLabel>
          <Button variant="dark" className="mt-3 px-4 py-1" type="submit">
            {loading ? <Spinner animation="border" /> : "Login"}
          </Button>
          <NavLink to="/register" className="text-info mt-3">
            Create new Account?
          </NavLink>
          <NavLink to="/resetpassword" className="text-info mt-3">
            Forgot Password?
          </NavLink>
          <h5 className="text-danger mt-3">{message}</h5>
        </Form>
      </div>
    </div>
  );
};
