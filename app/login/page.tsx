import { LoginForm } from '@/components/forms/LoginForm';
import { themeClasses } from '@/lib/theme-classes';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${themeClasses.text.heading}`}>
            Football Performance Tracker
          </h2>
          <p className={`mt-2 text-center text-sm font-medium ${themeClasses.text.primary}`}>
            Sign in to your account
          </p>
        </div>
        <div className={themeClasses.card.container + ' py-8 px-6'}>
          <LoginForm />
        </div>
        <div className={`text-center text-sm ${themeClasses.text.primary}`}>
          <p className={`font-medium ${themeClasses.text.primary}`}>Demo accounts:</p>
          <div className="mt-2 space-y-1">
            <p className={themeClasses.text.primary}>
              <span className={`font-semibold ${themeClasses.text.primary}`}>Admin:</span>{' '}
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-black">coach@club.local</span>
              {' / '}
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-black">Coach@123!</span>
            </p>
            <p className={themeClasses.text.primary}>
              <span className={`font-semibold ${themeClasses.text.primary}`}>Staff:</span>{' '}
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-black">staff@club.local</span>
              {' / '}
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-black">Staff@123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

