import Header from "./components/Header"
import MainLayout from "./layouts/MainLayout"
import { Link } from "react-router-dom"

function Home() {
  return (
    <MainLayout>
      <Header />

      <main className="p-8">
        <h1 className="text-4xl font-bold">Welcome to QAHub</h1>

        <p className="mt-2 text-gray-600">
          Your AI Powered QA Engineering Platform
        </p>

        <Link
          to="/login"
          className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 text-white"
        >
          Go to Login
        </Link>
      </main>
    </MainLayout>
  )
}

export default Home