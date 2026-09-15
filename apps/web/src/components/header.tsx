import WebHeader from "./web/WebHeader";

export default function Header({ signedIn }: { signedIn: boolean }) {
  return <WebHeader signedIn={signedIn} />;
}
