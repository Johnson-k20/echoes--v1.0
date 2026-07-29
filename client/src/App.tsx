import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Recording from "./pages/Recording";
import Timeline from "./pages/Timeline";
import Collections from "./pages/Collections";
import FutureSelf from "./pages/FutureSelf";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import AuthLayout from "./components/AuthLayout";
import Onboarding from "./pages/Onboarding";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/app"}>
        {(params) => <AuthLayout><Recording /></AuthLayout>}
      </Route>
      <Route path={"/timeline"}>
        {(params) => <AuthLayout><Timeline /></AuthLayout>}
      </Route>
      <Route path={"/collections"}>
        {(params) => <AuthLayout><Collections /></AuthLayout>}
      </Route>
      <Route path={"/future-self"}>
        {(params) => <AuthLayout><FutureSelf /></AuthLayout>}
      </Route>
      <Route path={"/insights"}>
        {(params) => <AuthLayout><Insights /></AuthLayout>}
      </Route>
      <Route path={"/settings"}>
        {(params) => <AuthLayout><Settings /></AuthLayout>}
      </Route>
      <Route path={"/onboarding"}>
        {(params) => <AuthLayout><Onboarding /></AuthLayout>}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
