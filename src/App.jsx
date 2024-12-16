/** @format */

import { Home, Login, Teams, Informations } from "./pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { DefaultLayout } from "./components";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './commons/NotFound';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Provider store={store}>
      <DefaultLayout>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/equipes" element={
            <PrivateRoute>
              <Teams />
            </PrivateRoute>
          } />
          <Route path="/informations" element={
            <PrivateRoute>
              <Informations />
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DefaultLayout>
    </Provider>
  );
}

export default App;
