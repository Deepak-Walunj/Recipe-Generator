import "@component/pages/css/LockedFeature.css"

export default function LockedFeature({ label="Locked", tooltip= "Upgrade to access"}){
    return(
        <span className="locked_feature" title={tooltip} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/><path d="M17 8V7a5 5 0 10-10 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <small style={{fontSize: 13}}>{label}</small>
        </span>
    )
}