type MainLayoutProps = {
  children: React.ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      {children}
    </div>
  )
}

export default MainLayout