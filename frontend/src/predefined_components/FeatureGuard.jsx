import { Navigate } from "react-router-dom";
/**
 * If featureAllowed is false, redirect or render fallback.
 * usage: <FeatureGuard allow={canSuggestRecipe}><SuggestPage /></FeatureGuard>
 */
export default function FeatureGuard({ allow, fallback = null, children }) {
  if (!allow) {
    if (fallback) return fallback;
    // default fallback: redirect to dashboard home
    return <Navigate to="/uregister" replace />;
  }
  return children;
}
