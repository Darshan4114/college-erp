import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import styl from "styles/css/app.module.css";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import nProgress from "nprogress";

import AuthProvider from "../components/AuthProvider";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  // const [fromPlaceId, setFromPlaceId] = useState(null);
  // const [toPlaceId, setToPlaceId] = useState(null);
  // const [fromPlace, setFromPlace] = useState(null);
  // const [toPlace, setToPlace] = useState(null);
  // const [gMap, setGMap] = useState(null);

  const NO_NAV_PAGE_LIST = ["/login", "/register"];

  // useEffect(() => {
  //   setTabValue(router.asPath);
  // }, [router.asPath]);

  useEffect(() => {
    router.events.on("routeChangeStart", () => nProgress.start());
    router.events.on("routeChangeComplete", () => nProgress.done());
    router.events.on("routeChangeError", () => nProgress.done());
  }, [router.events]);
  const googleApiUrl = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
          integrity="sha512-42kB9yDlYiCEfx2xVwq0q7hT4uf26FUgSIZBK8uiaEnTdShXjwr8Ip1V4xGJMg3mHkUt9nNuTDxunHF0/EgxLQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <AuthProvider>
        {/* <MapContext.Provider
          value={{
            setFromPlaceId: setFromPlaceId,
            setToPlaceId: setToPlaceId,
            fromPlaceId: fromPlaceId,
            toPlaceId: toPlaceId,
            fromPlace: fromPlace,
            toPlace: toPlace,
            setFromPlace: setFromPlace,
            setToPlace: setToPlace,
            gMap: gMap,
            setGMap: setGMap,
          }}
        > */}
        <div
          className={
            !NO_NAV_PAGE_LIST.includes(router.asPath) &&
            styl.navAndComponentContainer
          }
        >
          {/* Not rendering nav on login/register pages  */}
          {!NO_NAV_PAGE_LIST.includes(router.asPath) && <Nav />}
          <Component {...pageProps} />
        </div>
        {/* </MapContext.Provider> */}
        <ToastContainer
          position="bottom-center"
          autoClose={1000}
          hideProgressBar
          transition={Slide}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <script defer src={googleApiUrl} />
      </AuthProvider>
    </>
  );
}

export default MyApp;
