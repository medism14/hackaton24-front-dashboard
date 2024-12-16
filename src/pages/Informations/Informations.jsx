/** @format */

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faBriefcase,
  faCalendarAlt,
  faStar,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import Loader from "../../commons/Loader";

const Informations = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  console.log(user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    console.log("Déconnexion réussie");
  };

  if (loading) {
    return <Loader />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-primary-dark p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-xl p-8 shadow-xl border border-[#2ECC71]/10 transition duration-300 ease-in-out hover:shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#2ECC71]">
              Mes Informations
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Déconnexion
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-300">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#1f1f1f] border border-[#2ECC71]/20 rounded-lg p-3 text-white focus:border-[#2ECC71] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-300">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#1f1f1f] border border-[#2ECC71]/20 rounded-lg p-3 text-white focus:border-[#2ECC71] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#1f1f1f] border border-[#2ECC71]/20 rounded-lg p-3 text-white focus:border-[#2ECC71] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300">Téléphone</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-[#1f1f1f] border border-[#2ECC71]/20 rounded-lg p-3 text-white focus:border-[#2ECC71] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300">Poste</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-[#1f1f1f] border border-[#2ECC71]/20 rounded-lg p-3 text-white focus:border-[#2ECC71] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#2ECC71] text-white hover:bg-[#27ae60] transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-5 h-5 text-[#2ECC71]"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Nom complet</p>
                    <p className="text-white">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-5 h-5 text-[#2ECC71]"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-5 h-5 text-[#2ECC71]"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Téléphone</p>
                    <p className="text-white">{user.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="w-5 h-5 text-[#2ECC71]"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Poste</p>
                    <p className="text-white">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="w-5 h-5 text-[#2ECC71]"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Date d'embauche</p>
                    <p className="text-white">{formatDate(user.hire_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="w-5 h-5 text-[#2ECC71]"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Grade</p>
                    <p className="text-white">{user.grade}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-lg bg-[#2ECC71] text-white hover:bg-[#27ae60] transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Informations;
