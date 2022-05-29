if (!self.define) {
  let e,
    s = {};
  const a = (a, i) => (
    (a = new URL(a + ".js", i).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, n) => {
    const r =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[r]) return;
    let c = {};
    const t = (e) => a(e, r),
      f = { module: { uri: r }, exports: c, require: t };
    s[r] = Promise.all(i.map((e) => f[e] || t(e))).then((e) => (n(...e), c));
  };
}
define(["./workbox-75794ccf"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/chunks/219-187e57509a83bc7b.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/251-f6f4d0bab0cba627.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/435-1b7e2955568fe7eb.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/491.311aff24e9a00efa.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/536-20ccd21b9dd9ba38.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/719-9bd37f6cde4143b2.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/72a30a16.3dedd92807f9d5e4.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/782-dd15ef50f6697fef.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/850-1f556d82ce86b922.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/856.bdb113457f052529.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/861-18740b8f494bf729.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/878-d91a6abcf0bbdac9.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/903-59cffb8608474c95.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/913-d2f5674633b98ef4.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/ad7f724d.bb7c1bc094ab0c87.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/e78312c5-06ffb3230d1fe8e4.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/framework-01395af778c6fb71.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/main-489f272e5e3bdf38.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/_app-396e6d61847ba104.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/_error-d742f979193aeae4.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/edit-profile-17631856d109352b.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/index-d4f6b4e53e80c028.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/login-aae68bd0939e4094.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/my-profile-94cea3faf2ac3a84.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/register-a7ab9e647e0770f6.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/settings-e0ae0e827288200f.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/students-c13bea9d07bb788b.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/pages/users-b970c059194c3f3e.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/chunks/webpack-657ce2f872b4de0b.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/css/5b7e1a438169ed01.css",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/css/e21a1db3610d5287.css",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/css/e3152388ad8a44c9.css",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/css/f847a25149a53b3d.css",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/sW8fFLarsHj2--HaJqyMl/_buildManifest.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/sW8fFLarsHj2--HaJqyMl/_middlewareManifest.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/_next/static/sW8fFLarsHj2--HaJqyMl/_ssgManifest.js",
          revision: "sW8fFLarsHj2--HaJqyMl",
        },
        {
          url: "/dyp-exam-manager-firebase-adminsdk-evmj5-841fb9af96.json",
          revision: "35fecc63ae932e284bc9f77e1af725e1",
        },
        { url: "/favicon.ico", revision: "c30c7d42707a47a3f4591831641e50dc" },
        {
          url: "/img/calendar.svg",
          revision: "9d8278bf6fe53cd7fa691d7238b83336",
        },
        { url: "/img/check.png", revision: "3e3a49d468b25ad23ad98deb726bff4b" },
        {
          url: "/img/course.svg",
          revision: "20a5a9fa67a7dbda9b1b28fc2b8452aa",
        },
        { url: "/img/crop.svg", revision: "b624fafe68eb5c0247384d2233a736fd" },
        {
          url: "/img/delete.svg",
          revision: "c297afb02ff77a471c9a7a082586d199",
        },
        { url: "/img/dkd.jpeg", revision: "173e7d6dd6bd289039e367eb630c4a15" },
        { url: "/img/edit.svg", revision: "d13155da034390d59740064c8592fe28" },
        { url: "/img/empty.png", revision: "c9477b1f1820f9acfb93eebb2e6679c2" },
        { url: "/img/exam.svg", revision: "4ee85df0c6e2e4a6e8d74ce72049cba8" },
        {
          url: "/img/google.svg",
          revision: "d44733046e69f5722a7de9d2640dd7f9",
        },
        { url: "/img/ham.png", revision: "a055ec63be8032646a2cf5016a4615ce" },
        { url: "/img/ham.svg", revision: "df69f9778b37dbe4d8e8f80a493579de" },
        { url: "/img/info.svg", revision: "e041ca44d21cb68e777a709fe338839e" },
        { url: "/img/lock.png", revision: "527173bb54f4002bbfbf74ead4be6280" },
        { url: "/img/logo.jpeg", revision: "a0f1932bedaff3da9190c25a48ab9038" },
        { url: "/img/logo.png", revision: "be07911585a210848149198a365f00e0" },
        {
          url: "/img/logo_v.png",
          revision: "a39e6e720e62dabdf2fa2d5416716aa3",
        },
        {
          url: "/img/logout.svg",
          revision: "c2bc4cbbb22cb44eb1e30e069ab31099",
        },
        { url: "/img/mail.svg", revision: "104e9bca3e2931fd77f700c9e8df3883" },
        { url: "/img/menu.svg", revision: "9ab0811c0db5e1474017f48a42acff27" },
        { url: "/img/pdf.png", revision: "3451a78ed0d82b9334799e6570c4a8a6" },
        { url: "/img/phone.png", revision: "a1a9b2971a0c404dd96a61fb8e89e452" },
        { url: "/img/phone.svg", revision: "fc654f5bad6c16460bce53991ff92691" },
        { url: "/img/plus.svg", revision: "28210f237bd93dd8f503abef713d1543" },
        {
          url: "/img/plus_dark.svg",
          revision: "a36a650b83f60430704f812a267be919",
        },
        {
          url: "/img/search.svg",
          revision: "b181c14f5297cdac59523797a628e7c2",
        },
        {
          url: "/img/settings.svg",
          revision: "a73d0cb8254998042cb21b760c96c297",
        },
        { url: "/img/logo.jpeg", revision: "136bb15a0df0f2875adfb00b4b8ac962" },
        {
          url: "/img/student.svg",
          revision: "3d07354bbbd6c95513983bd6dcec13ea",
        },
        {
          url: "/img/subject.svg",
          revision: "6a948803ad8858e23b01ad564a2e7883",
        },
        {
          url: "/img/unlock.png",
          revision: "7042fc40b637a178be6f8105b5ec6509",
        },
        { url: "/img/user.png", revision: "1a817a95a42d8c43031378d122a05ffe" },
        { url: "/img/users.svg", revision: "6b32c8300d5049fb8897e971fcd9545d" },
        {
          url: "/pdf/httemplate.pdf",
          revision: "3a5f670a2013bf7bfc30f033a55d2a77",
        },
        { url: "/vercel.svg", revision: "4b4f1876502eb6721764637fe5c41702" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: i,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
