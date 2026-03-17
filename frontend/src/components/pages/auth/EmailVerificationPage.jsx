import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyEmailApi } from "@repositories/AuthRepo";
import "@components/pages/css/VerifyEmail.css";

export default function VerifyEmail() {
    const [status, setStatus] = useState("loading"); 
    // loading | success | verified | expired | error
    const [isVerified, setIsVerified] = useState(null)
    const [message, setMessage] = useState("Verifying your email...");
    const [params] = useSearchParams();
    const token = params.get("token");
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Invalid verification link.");
                return;
            }
            try {
                const res = await verifyEmailApi(token);

                if (!res?.success) {
                    setStatus("error");
                    setMessage(res?.message || "Verification failed.");
                    return;
                }
                setStatus(res?.data?.status); // "success" | "verified"
                setMessage(res?.message);
                setIsVerified(res?.data?.is_verified); // FIXED
            } catch (err) {
                if (err?.message?.includes("expired")) {
                    setStatus("expired");
                    setMessage("Verification link has expired.");
                } else {
                    setStatus("error");
                    setMessage("Something went wrong.");
                }
            }
        };

        verify();
    }, [token]);

    const renderActions = () => {
        switch (status) {
            case "verified":
                return (
                    <span>
                        Already Verified — Go to Login
                    </span>
                );
            case "success":
                return (
                    <span>
                        Go to Login
                    </span>
                );
            case "expired":
                return (
                    <span>
                        Resend Verification
                    </span>
                );

            case "error":
                return (
                    <span>
                        Close
                    </span>
                );
            default:
                return null;
        }
    };
    return (
        <div className="verify-container">
            <div className="verify-card">
                <div className={`icon ${status}`} />
                <h2>{message}</h2>
                {status === "loading" && (
                    <p>Please wait while we verify your email...</p>
                )}
                <div className="actions">
                    {renderActions()}
                </div>
            </div>
        </div>
    );
}