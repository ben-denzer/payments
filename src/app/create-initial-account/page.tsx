import SignupForm from './SignupForm';

interface PageProps {
  searchParams: Promise<{
    key?: string;
  }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const providedKey = params.key;
  const requiredKey = process.env.INITIAL_ACCOUNT_SIGNUP_SECRET;

  // Check if both key and environment variable are defined and match
  if (!providedKey || !requiredKey || providedKey !== requiredKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Unauthorized</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              If you think this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Credentials are valid, render the signup form
  return <SignupForm />;
}
