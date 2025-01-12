import { useEffect } from "react";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username");

    // Redirect to the login page if no username is found and not already on the login page
    if (!username && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
