import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Loader2, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const VerifyAccountPage = () => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { authUser, verifyEmail,isAuthintecated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  if (!email) {
  return <div>Error: no email found. Go back to signup.</div>;
}
  if (!isAuthintecated ) {
  return <div className="flex items-center justify-center h-screen"><Loader className="size-10 animate-spin"/></div>; 
}
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Verification code is required");

    setIsVerifying(true);
    try {
      await verifyEmail(email, code);
      toast.success("Email verified successfully!");
      navigate("/"); // or wherever the user should go next
    } catch (error) {
      console.log(error);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors">
                <Mail className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Verify Your Email</h1>
              <p className="text-base-content/60">
                Enter the code sent to <strong>{authUser?.email}</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Verification Code</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Didn't receive the code?{" "}
              <button
                className="link link-primary"
                onClick={() => toast("Resend functionality not implemented yet")}
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Almost there!"
        subtitle="Check your email and enter the verification code to complete your signup."
      />
    </div>
  );
};

export default VerifyAccountPage;
