import AuthWrapper from '@/components/auth/AuthWrapper'
import AuthForm from '@/components/auth/AuthForm'

export default function Home() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Golf Stats</h1>
            <p className="text-gray-600">
              Track your green reading data and improve your putting
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </AuthWrapper>
  )
}
