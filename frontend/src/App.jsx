
import AppRotas from "./routes/AppRotas"
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <AppRotas />
    </AuthProvider>
  )
}

export default App