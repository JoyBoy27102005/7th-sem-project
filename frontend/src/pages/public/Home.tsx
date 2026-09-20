import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Compass, BookOpen, Briefcase, Infinity } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
      </div>

      {/* Header Area */}
      <header className="relative z-20 w-full py-6 px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
        
        {/* Left: Logo */}
        <div className="flex flex-row items-center gap-4 cursor-pointer hover:scale-105 transition-all duration-300">
          <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-3xl bg-white text-foreground shadow-lg shadow-black/5">
            <Infinity className="w-8 h-8 md:w-9 md:h-9" strokeWidth={3} />
          </div>
          <span className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
            NextStep<span className="text-[#B8860B]">.ai</span>
          </span>
        </div>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 z-10">
          <Link to="/login" className="px-4 py-2 text-sm md:text-base font-semibold text-foreground hover:text-primary transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm md:text-base font-medium rounded-xl text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-md shadow-primary/20 transition-all hover:scale-105">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 md:p-12 lg:px-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-5xl mx-auto pt-20 md:pt-32 pb-16">
          <h1 
            className="text-[48px] font-bold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 font-heading leading-tight"
          >
            Navigate Your Future with <br className="hidden md:block" />
            <span className="text-[#B8860B]">
              Confidence
            </span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          >
            Your dream career shouldn't be a mystery. Let our AI-driven platform analyze your potential, pinpoint your skill gaps, and generate a step-by-step roadmap tailored just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-lg shadow-primary/25 transition-all hover:scale-105"
            >
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>

          {/* Quote Block */}
          <div className="mt-16 md:mt-24 p-6 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border max-w-2xl animate-in fade-in duration-1000 delay-500">
            <p className="italic text-lg md:text-xl text-foreground/80 mb-4">
              "The future belongs to those who learn more skills and combine them in creative ways."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-[#B8860B]/40"></div>
              <span className="font-semibold text-[#B8860B]">Robert Greene</span>
              <div className="h-[1px] w-8 bg-[#B8860B]/40"></div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full max-w-6xl mx-auto py-16">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-foreground mb-4 font-heading">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg">Our AI analyzes your profile to give you actionable insights.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-[22px] font-semibold text-card-foreground mb-2">Smart Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                We evaluate your skills against industry standards to find the perfect career role for you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-[22px] font-semibold text-card-foreground mb-2">Skill Gap Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover exactly what skills you're missing and how to learn them efficiently.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-[22px] font-semibold text-card-foreground mb-2">Personalized Roadmap</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get a structured, month-by-month study plan tailored specifically to your goals.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-[22px] font-semibold text-card-foreground mb-2">Interview Prep</h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice with AI-generated technical and behavioral questions for your target role.
              </p>
            </div>
            
          </div>
        </section>

      </main>
      
      {/* Simple Footer */}
      <footer className="w-full border-t border-border py-6 text-center z-10 bg-background/80 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} NextStep.ai. Empowering the next generation of professionals.
        </p>
      </footer>
    </div>
  );
};

export default Home;
