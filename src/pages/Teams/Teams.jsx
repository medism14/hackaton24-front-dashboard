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
  faUserPlus,
  faSearch,
  faProjectDiagram,
  faTimes,
  faCalendar,
  faMapMarkerAlt,
  faEuroSign,
  faBolt
} from "@fortawesome/free-solid-svg-icons";
import usersData from "../../data/users.json";
import teamsData from "../../data/teams.json";
import { useDispatch, useSelector } from "react-redux";
import { startPageLoading, stopPageLoading } from "../../redux/features/loadingSlice";
import Loader from "../../commons/Loader";
import { projects } from "../../data/projects.json";

const Teams = () => {
  const [currentUser, setCurrentUser] = useState(usersData.users[2]); // Pierre Martin
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("myTeam");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  useEffect(() => {
    setTeams(teamsData.teams);
    setUsers(usersData.users);
  }, []);

  const getTeamMembers = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return users.filter(user => team.team_members.includes(user.id));
  };

  const getManagedTeams = () => {
    return teams.filter((team) => team.manager_id === currentUser.id);
  };

  const getMyTeam = () => {
    return teams.find(team => team.team_members.includes(currentUser.id));
  };

  const getTeamManager = (managerId) => {
    return users.find((user) => user.id === managerId);
  };

  const getAvailableUsers = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return users.filter(user => !team.team_members.includes(user.id));
  };

  const getFilteredAvailableUsers = (teamId) => {
    const availableUsers = getAvailableUsers(teamId);
    if (!searchTerm) return availableUsers;
    
    return availableUsers.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const caMatch = user.ca_number ? user.ca_number.toLowerCase().includes(searchLower) : false;
      return fullName.includes(searchLower) || caMatch;
    });
  };

  const getMemberProjects = (memberId) => {
    return projects.filter(project => project.user_id === memberId);
  };

  const handleShowProjects = (member) => {
    // Only show projects if user is a manager of the team
    const managedTeams = getManagedTeams();
    const isManagedMember = managedTeams.some(team => team.team_members.includes(member.id));
    
    if (isManagedMember) {
      setSelectedMember(member);
      setShowProjectsModal(true);
    }
  };

  const handleAddMember = (teamId, userId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      team.team_members.push(userId);
      setTeams([...teams]);
    }
    setShowAddMemberModal(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      dispatch(startPageLoading("teams"));

      try {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 1000);
          
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

    return () => {
      controller.abort();
      dispatch(stopPageLoading());
    };
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  const myTeam = getMyTeam();
  const myTeamManager = myTeam ? getTeamManager(myTeam.manager_id) : null;
  const myTeamMembers = myTeam ? getTeamMembers(myTeam.id) : [];
  const isManager = getManagedTeams().length > 0;

  const renderMemberCard = (member, isManaged = false) => (
    <div 
      key={member.id} 
      className={`bg-[#272727] rounded-xl p-6 hover:bg-[#2a2a2a] transition-all duration-300 border border-[#2ECC71]/10 ${isManaged ? 'cursor-pointer' : ''}`}
      onClick={() => isManaged && handleShowProjects(member)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">
            {member.first_name} {member.last_name}
          </h4>
          {isManaged && (
            <p className="text-sm text-gray-400 mt-1">
              {getMemberProjects(member.id).length} projets en cours
            </p>
          )}
        </div>
        <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-xs font-medium">
          {member.grade}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-gray-400 text-sm">
          <FontAwesomeIcon
            icon={faPhone}
            className="w-4 mr-2 text-[#2ECC71]"
          />
          {member.phone_number}
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="w-4 mr-2 text-[#2ECC71]"
          />
          {member.email}
        </div>
        {member.ca_number && (
          <div className="flex items-center text-gray-400 text-sm">
            <FontAwesomeIcon
              icon={faIdCard}
              className="w-4 mr-2 text-[#2ECC71]"
            />
            {member.ca_number}
          </div>
        )}
      </div>
    </div>
  );

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
        {isManager && (
          <button
            onClick={() => setActiveSection("managedTeams")}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              activeSection === "managedTeams"
                ? "bg-[#2ECC71] text-white"
                : "bg-[#1f1f1f] text-[#2ECC71] hover:bg-[#2ECC71]/20"
            }`}
          >
            Équipes gérée(s)
          </button>
        )}
      </div>

      {activeSection === "myTeam" && myTeam && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-xl p-8 shadow-xl border border-[#2ECC71]/10 transition duration-300 ease-in-out hover:shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#2ECC71] mb-2">
                Mon Équipe
              </h2>
              <p className="text-gray-400">{myTeam.team_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full font-medium">
                Niveau {myTeam.level}
              </span>
              <span className="px-4 py-2 bg-[#1f1f1f] text-gray-400 rounded-full text-sm">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                {myTeamMembers.length} membres
              </span>
            </div>
          </div>

          {myTeamManager && (
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
                  <h3 className="text-xl font-bold text-white">
                    {myTeamManager.first_name} {myTeamManager.last_name}
                  </h3>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="mr-2 text-[#2ECC71]"
                      />
                      {myTeamManager.phone_number}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="mr-2 text-[#2ECC71]"
                      />
                      {myTeamManager.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTeamMembers.filter(member => member.id !== myTeamManager?.id).map((member) => renderMemberCard(member))}
          </div>
        </div>
      )}

      {activeSection === "managedTeams" && isManager && (
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
                    <button
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        setShowAddMemberModal(true);
                      }}
                      className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27ae60] transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faUserPlus} />
                      Ajouter un membre
                    </button>
                    <span className="px-6 py-2 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full font-semibold border border-[#2ECC71]/20 shadow-inner">
                      Niveau {team.level}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getTeamMembers(team.id).map((member) => renderMemberCard(member, true))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddMemberModal(false);
            }
          }}
        >
          <div className="bg-[#272727] rounded-xl p-8 w-[800px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2ECC71]">
                Ajouter un nouveau membre
              </h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou numéro CA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-[40px] py-3 bg-[#1f1f1f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-4">
              {getFilteredAvailableUsers(selectedTeamId).map((user) => {
                const userProjects = getMemberProjects(user.id);
                return (
                  <div
                    key={user.id}
                    className="bg-[#1f1f1f] rounded-xl p-6 hover:bg-[#242424] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-white text-lg font-semibold">
                          {user.first_name} {user.last_name}
                        </h4>
                        <p className="text-[#2ECC71] text-sm mt-1">{user.grade}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(selectedTeamId, user.id)}
                        className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
                      >
                        Ajouter à l'équipe
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-400">
                        <FontAwesomeIcon icon={faPhone} className="w-4 mr-2 text-[#2ECC71]" />
                        {user.phone_number}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <FontAwesomeIcon icon={faEnvelope} className="w-4 mr-2 text-[#2ECC71]" />
                        {user.email}
                      </div>
                    </div>

                    {userProjects.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-[#2ECC71] font-medium mb-3">Projets en cours</h5>
                        <div className="grid grid-cols-1 gap-3">
                          {userProjects.map(project => (
                            <div key={project.id} className="bg-[#2a2a2a] rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="text-white font-medium">{project.project_name}</h6>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="text-gray-400">
                                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#2ECC71]" />
                                      {project.location}
                                    </span>
                                    <span className="text-gray-400">
                                      <FontAwesomeIcon icon={faBolt} className="mr-2 text-[#2ECC71]" />
                                      {project.power_kwc} kWc
                                    </span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  project.project_status === 'En cours' ? 'bg-blue-500/10 text-blue-500' :
                                  project.project_status === 'Terminé' ? 'bg-green-500/10 text-green-500' :
                                  'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                  {project.project_status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-sm">
                                <span className="text-[#2ECC71]">
                                  <FontAwesomeIcon icon={faEuroSign} className="mr-2" />
                                  {project.amount_due_client.toLocaleString()}€
                                </span>
                                <span className="text-gray-400">
                                  <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                                  Mise en service: {project.date_pdb}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showProjectsModal && selectedMember && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProjectsModal(false);
            }
          }}
        >
          <div className="bg-[#272727] rounded-xl p-8 w-[800px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2ECC71]">
                Projets de {selectedMember.first_name} {selectedMember.last_name}
              </h3>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="space-y-4">
              {getMemberProjects(selectedMember.id).map((project) => (
                <div
                  key={project.id}
                  className="bg-[#1f1f1f] rounded-xl p-6 hover:bg-[#242424] transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white text-lg font-semibold">{project.project_name}</h4>
                      <p className="text-gray-400 text-sm mt-1">{project.project_type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.project_status === 'En cours' ? 'bg-blue-500/10 text-blue-500' :
                      project.project_status === 'Terminé' ? 'bg-green-500/10 text-green-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {project.project_status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-400">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 mr-2 text-[#2ECC71]" />
                      {project.location}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <FontAwesomeIcon icon={faBolt} className="w-4 mr-2 text-[#2ECC71]" />
                      {project.power_kwc} kWc
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <span className="text-[#2ECC71] font-medium">
                      <FontAwesomeIcon icon={faEuroSign} className="mr-2" />
                      {project.amount_due_client.toLocaleString()}€
                    </span>
                    <span className="text-gray-400">
                      <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                      Mise en service: {project.date_pdb}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
