import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { GoogleLogo } from "@/components/atoms/icons/GoogleLogo";

interface GoogleSignInButtonPropsT {
  busy: boolean;
  onClick: () => void;
}

export function GoogleSignInButton(props: Readonly<GoogleSignInButtonPropsT>) {
  return (
    <Button
      variant="secondary"
      fullWidth
      disabled={props.busy}
      onClick={props.onClick}
    >
      {props.busy ? (
        <>
          <Spinner tone="ink" />
          <span>Connecting to Google…</span>
        </>
      ) : (
        <>
          <GoogleLogo />
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
}
