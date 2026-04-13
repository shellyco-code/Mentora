import Sidebar from './Sidebar'

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
