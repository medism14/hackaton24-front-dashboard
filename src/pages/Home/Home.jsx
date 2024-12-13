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
import { faFileExport, faFilter } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import {
  startPageLoading,
  stopPageLoading,
} from "../../redux/features/loadingSlice";
import Loader from "../../commons/Loader";

export default function Home() {
  const dispatch = useDispatch();

  const isLoading = useSelector((state) => state.loading.isLoading);

  const [activeSection, setActiveSection] = useState("projects");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Calcul optimisé des données avec useMemo
  const { projectStatusData, revenueByStatusData, projectTableData } =
    useMemo(() => {
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];

      // Fonction helper pour filtrer les projets par période
      const filterProjectsByDate = (projects) => {
        if (!startDate || !endDate) return projects;
        return projects.filter((p) => {
          const projectDate = new Date(p.date_completude);
          return projectDate >= startDate && projectDate <= endDate;
        });
      };

      // Fonction helper pour filtrer les projets par mois et statut
      const filterProjectsByMonthAndStatus = (month, status) => {
        let filtered = projects.filter(
          (p) =>
            p.project_status === status &&
            new Date(p.date_completude).getMonth() === month
        );
        return filterProjectsByDate(filtered);
      };

      // Calcul des métriques financières
      const filteredProjects = filterProjectsByDate(projects);
      const financialMetrics = {
        factured: filteredProjects
          .filter((p) => p.is_invoiced)
          .reduce((acc, p) => acc + p.amount_due_client, 0),
        due: filteredProjects
          .filter((p) => !p.is_invoiced && p.project_status === "Terminé")
          .reduce((acc, p) => acc + p.amount_due_client, 0),
        paid: filteredProjects
          .filter((p) => p.is_paid)
          .reduce((acc, p) => acc + p.amount_due_client, 0),
        invoiceable: filteredProjects
          .filter((p) => p.is_validated_by_voltaica && !p.is_invoiced)
          .reduce((acc, p) => acc + p.amount_due_client, 0),
        pendingValidation: filteredProjects
          .filter((p) => !p.is_validated_by_voltaica)
          .reduce((acc, p) => acc + p.amount_due_client, 0),
      };

      // Génération des données de statut des projets
      const projectStatusData = months.map((name, monthIndex) => ({
        name,
        Terminé: filterProjectsByMonthAndStatus(monthIndex, "Terminé").length,
        "En cours": filterProjectsByMonthAndStatus(monthIndex, "En cours")
          .length,
        "En attente": filterProjectsByMonthAndStatus(monthIndex, "En attente")
          .length,
      }));

      // Génération des données de revenus
      const revenueByStatusData = months.map((name, monthIndex) => {
        const terminedProjects = filterProjectsByMonthAndStatus(
          monthIndex,
          "Terminé"
        );
        const ongoingProjects = filterProjectsByMonthAndStatus(
          monthIndex,
          "En cours"
        );

        return {
          name,
          projetsTerminés: terminedProjects.reduce(
            (acc, curr) => acc + curr.amount_due_client,
            0
          ),
          projetsEnCours: ongoingProjects.reduce(
            (acc, curr) => acc + curr.amount_due_client,
            0
          ),
        };
      });

      // Transformation des données pour le tableau des projets
      const projectTableData = filterProjectsByDate(projects).map(
        ({
          id,
          project_name,
          client_name,
          project_status,
          power_kwc,
          amount_due_client,
          location,
          date_completude,
          is_invoiced,
          is_paid,
          is_validated_by_voltaica,
        }) => ({
          id,
          project_name,
          client_name,
          project_status,
          power_kwc,
          amount_due_client: `${amount_due_client}€`,
          location,
          date_completude,
          status_facturation: is_invoiced
            ? "Facturé"
            : is_paid
            ? "Payé"
            : is_validated_by_voltaica
            ? "Facturable"
            : "En attente",
        })
      );

      return {
        projectStatusData,
        revenueByStatusData,
        projectTableData,
        financialMetrics,
      };
    }, [startDate, endDate]);

  const csvData = projectTableData.map((project) => ({
    ...project,
    date_completude: new Date(project.date_completude).toLocaleDateString(),
  }));

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      dispatch(startPageLoading("home"));

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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-[#1f1f1f] text-[#2ECC71] rounded-lg hover:bg-[#2ECC71]/20"
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filtres
          </button>
          <CSVLink
            data={csvData}
            filename={"projets.csv"}
            className="px-4 py-2 bg-[#1f1f1f] text-[#2ECC71] rounded-lg hover:bg-[#2ECC71]/20"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Export CSV
          </CSVLink>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-lg p-6 border border-[#2ECC71]/20">
          <div className="flex gap-4">
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
        </div>
      )}

      {activeSection === "projects" && (
        <div className="bg-gradient-to-br from-[#3d3d3d] via-[#1d1d1d] to-[#0f0f0f] rounded-lg p-6 border border-[#2ECC71]/20">
          <h2 className="text-2xl font-bold text-[#2ECC71] mb-4">
            Statut des Projets
          </h2>
          <div className="mb-6 flex justify-center">
            <BarChart
              width={500}
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
              <Bar dataKey="Terminé" fill="#2ECC71" radius={[4, 4, 0, 0]} />
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
                  <th className="px-4 py-2">Montant</th>
                  <th className="px-4 py-2">Statut Facturation</th>
                </tr>
              </thead>
              <tbody>
                {projectTableData.map((project) => (
                  <tr key={project.id} className="border-b border-[#2ECC71]/10">
                    <td className="px-4 py-2">{project.project_name}</td>
                    <td className="px-4 py-2">{project.client_name}</td>
                    <td className="px-4 py-2">{project.project_status}</td>
                    <td className="px-4 py-2">{project.power_kwc}</td>
                    <td className="px-4 py-2">{project.amount_due_client}</td>
                    <td className="px-4 py-2">{project.status_facturation}</td>
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
            Commissions par Statut
          </h2>
          <div className="mb-6 flex justify-center">
            <LineChart width={500} height={300} data={revenueByStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="projetsTerminés"
                name="Projets Terminés"
                stroke="#2ECC71"
              />
              <Line
                type="monotone"
                dataKey="projetsEnCours"
                name="Projets En Cours"
                stroke="#f39c12"
              />
            </LineChart>
          </div>
          <div className="relative overflow-auto max-h-60">
            <table className="min-w-full bg-[#272727] text-white">
              <thead className="bg-[--secondary-accent-dark] sticky top-0">
                <tr>
                  <th className="px-4 py-2 z-50">Mois</th>
                  <th className="px-4 py-2">Projets Terminés</th>
                  <th className="px-4 py-2">Projets En Cours</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {revenueByStatusData.map((data, index) => (
                  <tr key={index} className="border-b border-[#2ECC71]/10">
                    <td className="px-4 py-2">{data.name}</td>
                    <td className="px-4 py-2">{data.projetsTerminés}€</td>
                    <td className="px-4 py-2">{data.projetsEnCours}€</td>
                    <td className="px-4 py-2">
                      {data.projetsTerminés + data.projetsEnCours}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
