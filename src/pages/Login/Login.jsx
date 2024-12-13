/** @format */

import React from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../redux/features/authSlice";
import usersData from "../../data/users.json";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());

      const user = usersData.users.find((u) => u.email === data.email);

      if (user && data.password === "password") {
        if (rememberMe) {
          localStorage.setItem('userId', user.id.toString());
        }
        
        dispatch(
          loginSuccess({
            user,
            token: "fake-jwt-token",
          })
        );
        navigate("/");
      } else {
        throw new Error("Identifiants invalides");
      }
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/voltaica.jpeg"
            alt="Voltaica Logo"
            className="w-40 h-40 rounded-full shadow-xl border-4 border-[#2ECC71]/30 mb-8"
            loading="eager"
            fetchpriority="high"
          />
          <h2 className="text-4xl font-bold text-[#2ECC71] tracking-wide">
            Connexion
          </h2>
        </div>

        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-xl p-8 shadow-2xl border border-[#2ECC71]/20 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-5 w-5 text-[#2ECC71]"
                />
              </div>
              <input
                type="email"
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide",
                  },
                })}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#1f1f1f] border-2 border-[#2ECC71]/20 focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/30 text-white placeholder-[#2ECC71]/40 outline-none transition-all duration-300"
                placeholder="Adresse email"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-400 font-medium">{errors.email.message}</p>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faLock}
                  className="h-5 w-5 text-[#2ECC71]"
                />
              </div>
              <input
                type="password"
                {...register("password", {
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 6,
                    message: "Le mot de passe doit contenir au moins 6 caractères",
                  },
                })}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#1f1f1f] border-2 border-[#2ECC71]/20 focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/30 text-white placeholder-[#2ECC71]/40 outline-none transition-all duration-300"
                placeholder="Mot de passe"
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-400 font-medium">
                {errors.password.message}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-[#2ECC71] hover:text-[#2ECC71]/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="mr-3 w-4 h-4 accent-[#2ECC71]"
                />
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2ECC71] text-white font-medium rounded-lg transition-all duration-300 transform hover:bg-[#2ECC71]/90 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#2ECC71]/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
