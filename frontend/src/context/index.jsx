import { AuthProvider } from "./AuthContext";
import { CitiesProvider } from "./CitiesContext";
import { RouteProvider } from "./RouteContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CitiesProvider>
        <RouteProvider>
          {children}
        </RouteProvider>
      </CitiesProvider>
    </AuthProvider>
  );
}

export { useAuth } from "./AuthContext";
export { useCities } from "./CitiesContext";
export { useRoute } from "./RouteContext";
