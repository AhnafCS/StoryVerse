import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await api.auth.register(formData);
        toast.success("Account created successfully!");
        setIsSignUp(false);
      } else {
        const response = await api.auth.login({
          email: formData.email,
          password: formData.password,
        });
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success("Logged in successfully!");
        
        // Redirect to home feed
        navigate('/feed');
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Tab toggle */}
      <div className="flex mb-8 border-b border-border">
        <button
          onClick={() => setIsSignUp(false)}
          className={`flex-1 pb-3 text-sm font-body tracking-wider uppercase transition-all duration-300 ${
            !isSignUp
              ? "text-cream border-b-2 border-cream"
              : "text-muted-foreground hover:text-lavender"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={`flex-1 pb-3 text-sm font-body tracking-wider uppercase transition-all duration-300 ${
            isSignUp
              ? "text-cream border-b-2 border-cream"
              : "text-muted-foreground hover:text-lavender"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form
        className={`space-y-5 transition-all duration-300`}
        onSubmit={handleSubmit}
      >
          {isSignUp && (
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isSignUp ? "opacity-100 max-h-32" : "opacity-0 max-h-0"
              }`}
            >
              <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2 font-body">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full bg-muted/50 border border-border rounded-lg py-3 pl-10 pr-4 text-cream placeholder:text-muted-foreground/50 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender/30 transition-all duration-300 font-body text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2 font-body">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full bg-muted/50 border border-border rounded-lg py-3 pl-10 pr-4 text-cream placeholder:text-muted-foreground/50 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender/30 transition-all duration-300 font-body text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2 font-body">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full bg-muted/50 border border-border rounded-lg py-3 pl-10 pr-10 text-cream placeholder:text-muted-foreground/50 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender/30 transition-all duration-300 font-body text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-lavender transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button className="text-xs text-lavender hover:text-cream transition-colors font-body">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cream text-secondary-foreground font-body font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
  );
};

export default AuthForm;
