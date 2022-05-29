import Image from "next/image";
import styl from "styl/SearchBar.module.css";
export default function SearchBar() {
  return (
    <div className={styl.container}>
      <input type="text" />
      <div className={styl.searchIcon}>
        <Image height="22" width="22" src="/img/search.svg" alt="searchIcon" />
      </div>
    </div>
  );
}
