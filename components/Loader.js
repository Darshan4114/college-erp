import ContentLoader from "react-content-loader";
export default function Loader() {
  return (
    <>
      <ContentLoader style={{ width: "100%" }}>
        <rect x="0" y="0" rx="5" ry="5" width="190" height="170" />
        <rect x="200" y="17" rx="7" ry="4" width="600" height="13" />
        <rect x="200" y="40" rx="3" ry="3" width="550" height="10" />
      </ContentLoader>
      <ContentLoader style={{ width: "100%" }}>
        <rect x="0" y="0" rx="5" ry="5" width="190" height="170" />
        <rect x="200" y="17" rx="7" ry="4" width="600" height="13" />
        <rect x="200" y="40" rx="3" ry="3" width="550" height="10" />
      </ContentLoader>
      <ContentLoader style={{ width: "100%" }}>
        <rect x="0" y="0" rx="5" ry="5" width="190" height="170" />
        <rect x="200" y="17" rx="7" ry="4" width="600" height="13" />
        <rect x="200" y="40" rx="3" ry="3" width="550" height="10" />
      </ContentLoader>
    </>
  );
}
