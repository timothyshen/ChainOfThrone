"use client";
import { usePrivy } from "@privy-io/react-auth";

function LoginButton() {
  const { ready, authenticated, login } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <button disabled={disableLogin} onClick={login}>
      Log in
    </button>
  );
}

export default LoginButton;
