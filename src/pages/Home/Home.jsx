/** @format */

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CSVLink } from "react-csv";
import { projects } from "../../data/projects.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExport,
  faFilter,
  faProjectDiagram,
  faMoneyBill,
  faSpinner,
  faCheckCircle,
  faCalendarAlt,
  faTimes,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import {
  startPageLoading,
  stopPageLoading,
} from "../../redux/features/loadingSlice";
import Loader from "../../commons/Loader";
import apiClient from "../../api/axios";

export default function Home() {
  const dispatch = useDispatch();

  const isLoading = useSelector((state) => state.loading.isLoading);
  const currentUser = useSelector((state) => state.auth.user);

  const [activeSection, setActiveSection] = useState("projects");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all"); // Nouveau state pour le filtre de statut

  // Taux pour les revenus basés sur la puissance
  const STANDARD_POWER_RATE = 20; // 20€ par kWc pour les projets standards
  const BUSINESS_PROVIDER_POWER_RATE = 25; // 25€ par kWc pour les apporteurs d'affaires
  const MANAGER_COMMISSION_RATE = 0.07; // 7% de commission pour le manager sur le CA généré

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus("all"); // Reset du filtre de statut
  };

  const toggleFilters = () => {
    if (showFilters) {
      // Reset dates when closing filters
      clearFilters();
    }
    setShowFilters(!showFilters);
  };

  // Calcul optimisé des données avec useMemo
  const {
    projectStatusData,
    revenueByStatusData,
    projectTableData,
    projectStats,
    revenueStats,
  } = useMemo(() => {
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    // Filter projects for current user
    const userProjects = projects.filter((p) => p.user_id === currentUser?.id);

    // Fonction helper pour filtrer les projets par période et statut
    const filterProjectsByDateAndStatus = (projects) => {
      let filtered = projects;
      
      // Filtre par date
      if (startDate && endDate) {
        filtered = filtered.filter((p) => {
          const projectDate = new Date(p.date_pdb);
          return projectDate >= startDate && projectDate <= endDate;
        });
      }

      // Filtre par statut
      if (selectedStatus !== "all") {
        filtered = filtered.filter((p) => p.project_status === selectedStatus);
      }

      return filtered;
    };

    // Appliquer les filtres de date et statut
    const filteredUserProjects = filterProjectsByDateAndStatus(userProjects);

    // Fonction helper pour filtrer les projets par mois et statut
    const filterProjectsByMonthAndStatus = (month, status) => {
      let filtered = filteredUserProjects.filter(
        (p) =>
          p.project_status === status &&
          new Date(p.date_pdb).getMonth() === month
      );
      return filtered;
    };

    // Calcul des revenus pour les projets validés
    const validatedProjects = filteredUserProjects.filter(
      (p) => p.project_status === "Validé"
    );

    // Calcul des revenus basés sur la puissance avec distinction apporteur d'affaires
    const powerBasedRevenue = Math.floor(
      validatedProjects.reduce((acc, p) => {
        const rate = p.is_business_provider
          ? BUSINESS_PROVIDER_POWER_RATE
          : STANDARD_POWER_RATE;
        return acc + p.power_kwc * rate;
      }, 0)
    );

    // Calcul des commissions manager sur le CA généré par la puissance
    const managerCommission = Math.floor(
      powerBasedRevenue * MANAGER_COMMISSION_RATE
    );

    // Calcul des statistiques des projets
    const projectStats = {
      total: filteredUserProjects.length,
      completed: validatedProjects.length,
      inProgress: filteredUserProjects.filter(
        (p) => p.project_status === "En cours"
      ).length,
      pending: filteredUserProjects.filter(
        (p) => p.project_status === "En attente"
      ).length,
      totalPower: Math.floor(
        filteredUserProjects.reduce((acc, p) => acc + p.power_kwc, 0)
      ),
      averagePower: filteredUserProjects.length
        ? Math.floor(
            filteredUserProjects.reduce((acc, p) => acc + p.power_kwc, 0) /
              filteredUserProjects.length
          )
        : 0,
    };

    // Calcul des statistiques des revenus
    const revenueStats = {
      powerBasedRevenue,
      managerCommission,
      totalRevenue: powerBasedRevenue + managerCommission,
      averageRevenue: validatedProjects.length
        ? Math.floor(
            (powerBasedRevenue + managerCommission) / validatedProjects.length
          )
        : 0,
    };

    // Génération des données de statut des projets
    const projectStatusData = months.map((name, monthIndex) => ({
      name,
      Validé: filterProjectsByMonthAndStatus(monthIndex, "Validé").length,
      "En cours": filterProjectsByMonthAndStatus(monthIndex, "En cours").length,
      "En attente": filterProjectsByMonthAndStatus(monthIndex, "En attente")
        .length,
    }));

    // Génération des données de revenus
    const revenueByStatusData = months.map((name, monthIndex) => {
      const validatedProjectsInMonth = filterProjectsByMonthAndStatus(
        monthIndex,
        "Validé"
      );

      const powerRevenue = Math.floor(
        validatedProjectsInMonth.reduce((acc, p) => {
          const rate = p.is_business_provider
            ? BUSINESS_PROVIDER_POWER_RATE
            : STANDARD_POWER_RATE;
          return acc + p.power_kwc * rate;
        }, 0)
      );

      const monthlyManagerCommission = Math.floor(
        powerRevenue * MANAGER_COMMISSION_RATE
      );

      return {
        name,
        "Revenus kWc": powerRevenue,
        "Commission Manager": monthlyManagerCommission,
        Total: powerRevenue + monthlyManagerCommission,
      };
    });

    // Transformation des données pour le tableau des projets
    const projectTableData = filteredUserProjects.map(
      ({
        id,
        project_name,
        client_name,
        project_status,
        power_kwc,
        is_business_provider,
        location,
        date_pdb,
      }) => {
        const powerRate = is_business_provider
          ? BUSINESS_PROVIDER_POWER_RATE
          : STANDARD_POWER_RATE;
        const powerRevenue = Math.floor(power_kwc * powerRate);
        const managerCommission = Math.floor(
          powerRevenue * MANAGER_COMMISSION_RATE
        );

        return {
          id,
          project_name,
          client_name,
          project_status,
          power_kwc,
          potential_power_revenue:
            project_status === "Validé" ? `${powerRevenue}€` : "N/A",
          potential_commission:
            project_status === "Validé" ? `${managerCommission}€` : "N/A",
          total_revenue:
            project_status === "Validé"
              ? `${powerRevenue + managerCommission}€`
              : "N/A",
          location,
          date_pdb: new Date(date_pdb).toLocaleDateString(),
        };
      }
    );

    return {
      projectStatusData,
      revenueByStatusData,
      projectTableData,
      projectStats,
      revenueStats,
    };
  }, [startDate, endDate, selectedStatus, currentUser?.id]); // Ajout de selectedStatus aux dépendances

  const csvData = projectTableData.map((project) => ({
    "Nom du projet": project.project_name,
    Client: project.client_name,
    Statut: project.project_status,
    "Puissance (kWc)": project.power_kwc,
    "Revenu potentiel": project.potential_power_revenue,
    Commission: project.potential_commission,
    "Revenu total": project.total_revenue,
    Localisation: project.location,
    Date: project.date_pdb,
  }));

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      dispatch(startPageLoading("home"));

      try {
        // Simuler un chargement de données
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Ici vous pourriez ajouter une vraie requête API
        // const response = await apiClient.get('/projects', { signal: controller.signal });
        // setFilteredProjects(response.data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Erreur lors du chargement des données:", error);
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

  const handleExport = async (type) => {
    try {
      // Détermine quelles données envoyer selon la section active
      const headers = activeSection === "projects" 
        ? ["Nom du projet", "Client", "Statut", "Puissance (kWc)", "Revenu potentiel", "Commission", "Revenu total", "Localisation", "Date"]
        : ["Mois", "Revenus kWc", "Commission Manager", "Total"];

      const dataToExport = activeSection === "projects"
        ? [headers, ...projectTableData.map(project => [
            project.project_name,
            project.client_name, 
            project.project_status,
            project.power_kwc,
            project.potential_power_revenue,
            project.potential_commission,
            project.total_revenue,
            project.location,
            project.date_pdb
          ])]
        : [headers, ...revenueByStatusData.map(revenue => [
            revenue.name,
            revenue["Revenus kWc"],
            revenue["Commission Manager"], 
            revenue.Total
          ])];

      console.log(dataToExport);

      // // Appel API
      // const response = await apiClient.post(`/export/${type}`, {
      //   data: dataToExport,
      //   exportType: activeSection // "projects" ou "revenues"
      // });

      // // Téléchargement du fichier
      // const blob = new Blob([response.data], { 
      //   type: type === 'csv' ? 'text/csv' : 'application/pdf' 
      // });
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `export_${activeSection}_${new Date().toISOString()}.${type}`;
      // a.click();
      // window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Erreur lors de l'export:`, error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSection("projects")}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              activeSection === "projects"
                ? "bg-[#2ECC71] text-white"
                : "bg-[#1f1f1f] text-[#2ECC71] hover:bg-[#2ECC71]/20"
            }`}
          >
            Projets
          </button>
          <button
            onClick={() => setActiveSection("revenues")}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              activeSection === "revenues"
                ? "bg-[#2ECC71] text-white"
                : "bg-[#1f1f1f] text-[#2ECC71] hover:bg-[#2ECC71]/20"
            }`}
          >
            Revenus
          </button>
        </div>

        <div className="flex gap-4">
          {activeSection === "projects" && (
            <button
              onClick={toggleFilters}
              className="px-4 py-2 bg-[#1f1f1f] text-[#2ECC71] rounded-lg hover:bg-[#2ECC71]/20"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filtres
            </button>
          )}
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-[#1f1f1f] text-[#2ECC71] rounded-lg hover:bg-[#2ECC71]/20"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Export CSV
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-[#1f1f1f] text-[#2ECC71] rounded-lg hover:bg-[#2ECC71]/20"
          >
            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {showFilters && activeSection === "projects" && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-lg p-6 border border-[#2ECC71]/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#2ECC71]">
              Filtres actifs
            </h3>
            {(startDate || endDate || selectedStatus !== "all") && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-[#1f1f1f] text-[#2ECC71] rounded-lg hover:bg-[#2ECC71]/20 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} />
                Effacer les filtres
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Date début
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="bg-[#272727] text-white p-2 rounded border border-white focus:outline-none focus:ring-2 focus:ring-[#2ECC71] transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Date fin
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="bg-[#272727] text-white p-2 rounded border border-white focus:outline-none focus:ring-2 focus:ring-[#2ECC71] transition duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2ECC71] mb-2">
                Statut
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-48 bg-[#1f1f1f] text-white px-4 py-2.5 rounded-lg border-2 border-[#2ECC71]/20 hover:border-[#2ECC71]/40 focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 focus:outline-none transition-all duration-300 cursor-pointer appearance-none pr-10"
                >
                  <option value="all" className="bg-[#1f1f1f]">Tous les statuts</option>
                  <option value="Validé" className="bg-[#1f1f1f]">✓ Validé</option>
                  <option value="En cours" className="bg-[#1f1f1f]">⟳ En cours</option>
                  <option value="En attente" className="bg-[#1f1f1f]">⌛ En attente</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-[#2ECC71]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "projects" && !showFilters && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-lg p-6 border border-[#2ECC71]/20">
          <h2 className="text-2xl font-bold text-[#2ECC71] mb-4">
            Statut des Projets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] p-6 rounded-xl border border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Projets</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {projectStats.total}
                  </h3>
                </div>
                <div className="bg-[#2ECC71]/20 p-3 rounded-lg">
                  <FontAwesomeIcon
                    icon={faProjectDiagram}
                    className="text-[#2ECC71] text-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] p-6 rounded-xl border border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Projets en Cours</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {projectStats.inProgress}
                  </h3>
                </div>
                <div className="bg-[#2ECC71]/20 p-3 rounded-lg">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-[#2ECC71] text-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] p-6 rounded-xl border border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Puissance Totale</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {projectStats.totalPower} kWc
                  </h3>
                </div>
                <div className="bg-[#2ECC71]/20 p-3 rounded-lg">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-[#2ECC71] text-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <BarChart
              width={800}
              height={300}
              data={projectStatusData}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #2ECC71",
                  borderRadius: "8px",
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                }}
              />
              <Bar dataKey="Validé" fill="#2ECC71" radius={[4, 4, 0, 0]} />
              <Bar dataKey="En cours" fill="#f39c12" radius={[4, 4, 0, 0]} />
              <Bar dataKey="En attente" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>

          <div className="relative overflow-auto max-h-60">
            <table className="min-w-full bg-[#272727] text-white">
              <thead className="bg-[--secondary-accent-dark] sticky top-0">
                <tr>
                  <th className="px-4 py-2 z-50">Projet</th>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Puissance (kWc)</th>
                  <th className="px-4 py-2">Revenu kWc</th>
                  <th className="px-4 py-2">Commission Manager</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {projectTableData.map((project) => (
                  <tr key={project.id} className="border-b border-[#2ECC71]/10">
                    <td className="px-4 py-2">{project.project_name}</td>
                    <td className="px-4 py-2">{project.client_name}</td>
                    <td className="px-4 py-2">{project.project_status}</td>
                    <td className="px-4 py-2">{project.power_kwc}</td>
                    <td className="px-4 py-2">
                      {project.potential_power_revenue}
                    </td>
                    <td className="px-4 py-2">
                      {project.potential_commission}
                    </td>
                    <td className="px-4 py-2">{project.total_revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "revenues" && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-lg p-6 border border-[#2ECC71]/20">
          <h2 className="text-2xl font-bold text-[#2ECC71] mb-4">
            Revenus par Source
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] p-6 rounded-xl border border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenus kWc</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {revenueStats.powerBasedRevenue}€
                  </h3>
                  <p className="text-xs text-gray-400">
                    ({STANDARD_POWER_RATE}€/kWc standard,{" "}
                    {BUSINESS_PROVIDER_POWER_RATE}€/kWc apporteur)
                  </p>
                </div>
                <div className="bg-[#2ECC71]/20 p-3 rounded-lg">
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className="text-[#2ECC71] text-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] p-6 rounded-xl border border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Commission Manager</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {revenueStats.managerCommission}€
                  </h3>
                  <p className="text-xs text-gray-400">
                    ({MANAGER_COMMISSION_RATE * 100}% des revenus kWc)
                  </p>
                </div>
                <div className="bg-[#2ECC71]/20 p-3 rounded-lg">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-[#2ECC71] text-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] p-6 rounded-xl border border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenus</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {revenueStats.totalRevenue}€
                  </h3>
                </div>
                <div className="bg-[#2ECC71]/20 p-3 rounded-lg">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-[#2ECC71] text-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <LineChart width={500} height={300} data={revenueByStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Revenus kWc" stroke="#2ECC71" />
              <Line
                type="monotone"
                dataKey="Commission Manager"
                stroke="#f39c12"
              />
              <Line type="monotone" dataKey="Total" stroke="#e74c3c" />
            </LineChart>
          </div>

          <div className="relative overflow-auto max-h-60">
            <table className="min-w-full bg-[#272727] text-white">
              <thead className="bg-[--secondary-accent-dark] sticky top-0">
                <tr>
                  <th className="px-4 py-2 z-50">Mois</th>
                  <th className="px-4 py-2">Revenus kWc</th>
                  <th className="px-4 py-2">Commission Manager</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {revenueByStatusData.map((data, index) => (
                  <tr key={index} className="border-b border-[#2ECC71]/10">
                    <td className="px-4 py-2">{data.name}</td>
                    <td className="px-4 py-2">{data["Revenus kWc"]}€</td>
                    <td className="px-4 py-2">{data["Commission Manager"]}€</td>
                    <td className="px-4 py-2">{data["Total"]}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showFilters && activeSection === "projects" && (
        <div className="relative overflow-auto max-h-[60vh]">
          <table className="min-w-full bg-[#272727] text-white">
            <thead className="bg-[--secondary-accent-dark] sticky top-0">
              <tr>
                <th className="px-4 py-2 z-50">Projet</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Puissance (kWc)</th>
                <th className="px-4 py-2">Revenu kWc</th>
                <th className="px-4 py-2">Commission Manager</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {projectTableData.map((project) => (
                <tr key={project.id} className="border-b border-[#2ECC71]/10">
                  <td className="px-4 py-2">{project.project_name}</td>
                  <td className="px-4 py-2">{project.client_name}</td>
                  <td className="px-4 py-2">{project.project_status}</td>
                  <td className="px-4 py-2">{project.power_kwc}</td>
                  <td className="px-4 py-2">
                    {project.potential_power_revenue}
                  </td>
                  <td className="px-4 py-2">{project.potential_commission}</td>
                  <td className="px-4 py-2">{project.total_revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
