import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f3f4f6",
            padding: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#2563eb",
            }}
          >
            DHIS2 Clone - Working!
          </h1>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
