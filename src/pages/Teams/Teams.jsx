/** @format */

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserTie,
  faPhone,
  faEnvelope,
  faIdCard,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import usersData from "../../data/users.json";
import { useDispatch, useSelector } from "react-redux";
import { startPageLoading, stopPageLoading } from "../../redux/features/loadingSlice";
import Loader from "../../commons/Loader";

const Teams = () => {
  const [currentUser, setCurrentUser] = useState(usersData.users[2]);
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("myTeam");
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  useEffect(() => {
    setTeams([
      {
        id: 1,
        team_name: "Équipe Élite Voltaica",
        manager_id: 3,
        level: "Elite",
        created_at: "2023-01-15",
      },
      {
        id: 2,
        team_name: "Équipe Innovation",
        manager_id: 9,
        level: "Premium",
        created_at: "2023-06-20",
      },
    ]);
    setTeamMembers([
      { team_id: 1, user_id: 2 },
      { team_id: 1, user_id: 4 },
      { team_id: 1, user_id: 6 },
      { team_id: 1, user_id: 8 },
      { team_id: 2, user_id: 1 },
      { team_id: 2, user_id: 5 },
      { team_id: 2, user_id: 7 },
    ]);
    setUsers(usersData.users);
  }, []);

  const getTeamMembers = (teamId) => {
    const memberIds = teamMembers
      .filter((tm) => tm.team_id === teamId)
      .map((tm) => tm.user_id);
    return users.filter((user) => memberIds.includes(user.id));
  };

  const getManagedTeams = () => {
    return teams.filter((team) => team.manager_id === currentUser.id);
  };

  const getMyTeams = () => {
    const userTeamIds = teamMembers
      .filter((tm) => tm.user_id === currentUser.id)
      .map((tm) => tm.team_id);
    return teams.filter((team) => userTeamIds.includes(team.id));
  };

  const getTeamManager = (managerId) => {
    return users.find((user) => user.id === managerId);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      dispatch(startPageLoading("teams"));

      try {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 1000);
          
          // Si le contrôleur est aborté, on annule le timer
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject('Loading cancelled');
          });
        });
      } catch (error) {
        if (error !== 'Loading cancelled') {
          console.error("Erreur:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch(stopPageLoading());
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      controller.abort(); // Annule la promesse en cours
      dispatch(stopPageLoading()); // Reset le loading state
    };
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSection("myTeam")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 ${
            activeSection === "myTeam"
              ? "bg-[#2ECC71] text-white"
              : "bg-[#1f1f1f] text-[#2ECC71] hover:bg-[#2ECC71]/20"
          }`}
        >
          Mon équipe
        </button>
        <button
          onClick={() => setActiveSection("managedTeams")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 ${
            activeSection === "managedTeams"
              ? "bg-[#2ECC71] text-white"
              : "bg-[#1f1f1f] text-[#2ECC71] hover:bg-[#2ECC71]/20"
          }`}
        >
          Équipes Gérées
        </button>
      </div>

      {activeSection === "myTeam" && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-xl p-8 shadow-xl border border-[#2ECC71]/10 transition duration-300 ease-in-out hover:shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#2ECC71] mb-2">
                Mon Équipe
              </h2>
              <p className="text-gray-400">Équipe Élite Voltaica</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full font-medium">
                Niveau Elite
              </span>
              <span className="px-4 py-2 bg-[#1f1f1f] text-gray-400 rounded-full text-sm">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />5 membres
              </span>
            </div>
          </div>

          <div className="bg-[#1f1f1f] rounded-xl p-6 mb-8 border border-[#2ECC71]/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#2ECC71]/20 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faUserTie}
                  className="text-[#2ECC71] text-2xl"
                />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  Manager de l'équipe
                </p>
                <h3 className="text-xl font-bold text-white">Pierre Martin</h3>
                <p className="text-[#2ECC71]">Elite Manager</p>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-[#2ECC71]"
                    />
                    06 34 56 78 90
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="mr-2 text-[#2ECC71]"
                    />
                    pierre.martin@voltaica.fr
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#272727] rounded-xl p-6 hover:bg-[#2a2a2a] transition-all duration-300 border border-[#2ECC71]/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Marie Laurent
                  </h4>
                  <p className="text-[#2ECC71] text-sm">Executive Manager</p>
                </div>
                <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-xs font-medium">
                  Junior
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  06 23 45 67 89
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  marie.laurent@voltaica.fr
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  CCI-2024-002
                </div>
              </div>
            </div>

            <div className="bg-[#272727] rounded-xl p-6 hover:bg-[#2a2a2a] transition-all duration-300 border border-[#2ECC71]/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Sophie Dubois
                  </h4>
                  <p className="text-[#2ECC71] text-sm">Manager</p>
                </div>
                <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-xs font-medium">
                  Senior
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  06 45 67 89 01
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  sophie.dubois@voltaica.fr
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  CCI-2024-004
                </div>
              </div>
            </div>

            <div className="bg-[#272727] rounded-xl p-6 hover:bg-[#2a2a2a] transition-all duration-300 border border-[#2ECC71]/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Claire Moreau
                  </h4>
                  <p className="text-[#2ECC71] text-sm">Elite Manager</p>
                </div>
                <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-xs font-medium">
                  Senior
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  06 67 89 01 23
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  claire.moreau@voltaica.fr
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  CCI-2024-006
                </div>
              </div>
            </div>

            <div className="bg-[#272727] rounded-xl p-6 hover:bg-[#2a2a2a] transition-all duration-300 border border-[#2ECC71]/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Emma Leroy
                  </h4>
                  <p className="text-[#2ECC71] text-sm">Executive Manager</p>
                </div>
                <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-xs font-medium">
                  Senior
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  06 89 01 23 45
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  emma.leroy@voltaica.fr
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="w-4 mr-2 text-[#2ECC71]"
                  />
                  CCI-2024-008
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "managedTeams" && (
        <div className="bg-gradient-to-br from-[#4d4d4d] via-[#2d2d2d] to-[#1f1f1f] rounded-xl p-8 shadow-xl border border-[#2ECC71]/10 transition duration-300 ease-in-out hover:shadow-2xl hover:border-[#2ECC71]/30 mb-[50px]">
          <h2 className="text-2xl font-bold text-[#2ECC71] mb-6 flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-3 text-3xl" />
            Équipes que je gère
          </h2>
          <div className="grid grid-cols-1 gap-8">
            {getManagedTeams().map((team) => (
              <div
                key={team.id}
                className="bg-[#272727] rounded-xl p-8 border border-[#2ECC71]/10 hover:border-[#2ECC71]/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-[#2ECC71] to-[#27ae60] bg-clip-text text-transparent">
                      {team.team_name}
                    </h3>
                    <p className="text-gray-400 mt-2 flex items-center">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="mr-2 text-[#2ECC71]"
                      />
                      <span className="font-medium">
                        {getTeamMembers(team.id).length}
                      </span>{" "}
                      membres
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-6 py-2 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full font-semibold border border-[#2ECC71]/20 shadow-inner">
                      Niveau {team.level}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getTeamMembers(team.id).map((member) => (
                    <div
                      key={member.id}
                      className="p-6 bg-[#1f1f1f] rounded-xl hover:bg-[#242424] transition-all duration-300 border border-[#2ECC71]/5 hover:border-[#2ECC71]/20 shadow-md hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold text-lg">
                            {member.first_name} {member.last_name}
                          </h4>
                          <p className="text-sm text-[#2ECC71] font-medium mt-1">
                            {member.role}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1.5 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full font-medium border border-[#2ECC71]/20">
                          {member.grade}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm mt-3 hover:text-[#2ECC71] transition-colors">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="mr-2 text-[#2ECC71]"
                        />
                        {member.phone_number}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
