import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className="register-form">
      {/* First Name */}
      <div className={`input-container ${firstName && "focused"}`}>
        <FaUser className="input-icon" />
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label>First Name</label>
      </div>

      {/* Last Name */}
      <div className={`input-container ${lastName && "focused"}`}>
        <FaUser className="input-icon" />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <label>Last Name</label>
      </div>

      {/* Email */}
      <div className={`input-container ${email && "focused"}`}>
        <FaEnvelope className="input-icon" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Email</label>
      </div>

      {/* Password */}
      <div className={`input-container ${password && "focused"}`}>
        <FaLock className="input-icon" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Password</label>
      </div>

      <button type="submit" className="submit-btn">Register</button>
    </form>
  );
}

export default RegisterForm;
