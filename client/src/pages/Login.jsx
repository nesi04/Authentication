import React, { useContext, useState } from "react";
import { assets } from "../assets/assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import axios from "axios";
import { toast } from "react-toastify"; 

const InputField = ({ type, placeholder, value, onChange, icon }) => (
  <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5c]">
    <img src={icon} alt="" />
    <input
      className="bg-transparent outline-none w-full"
      type={type}
      placeholder={placeholder}
      required
      onChange={onChange}
      value={value}
    />
  </div>
);

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn ,getUserData} = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
        const url = state === "Sign Up" ? "/api/auth/register" : "/api/auth/login";
        const payload = state === "Sign Up" ? { name, email, password } : { email, password };

        const { data } = await axios.post(`${backendUrl}${url}`, payload, { withCredentials: true });

        if (data.success) {
            await getUserData();  // ✅ Ensure user data is fetched before updating state
            navigate("/");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
 };


  

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-100 to-blue-500">
      <img
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up" ? "Create a new account" : "Login to your account"}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <InputField type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} icon={assets.person_icon} />
          )}
          <InputField type="email" placeholder="Enter Email id" value={email} onChange={(e) => setEmail(e.target.value)} icon={assets.mail_icon} />
          <InputField type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} icon={assets.lock_icon} />
          
          {state === "Login" && (
            <p className="mb-4 text-indigo-500 cursor-pointer" onClick={() => navigate("/reset-password")}>
              Forgot password?
            </p>
          )}
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>
        <p className="text-gray-400 text-xs text-center mt-4">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span onClick={() => setState("Login")} className="text-blue-400 underline cursor-pointer">
                Login Here
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span onClick={() => setState("Sign Up")} className="text-blue-400 underline cursor-pointer">
                Sign Up Here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
