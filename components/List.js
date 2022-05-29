import styled from "styled-components";

export default function List({ list, cmp, className, props }) {
  if (!list || !list.length) return <div></div>;
  return (
    <StyledList className={className}>
      {list.map((data) => {
        return cmp({ data, ...props });
      })}
    </StyledList>
  );
}

const StyledList = styled.div`
  display: grid;
  margin: 1rem auto;
  padding-bottom: 2em;
  @media screen and (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
    max-width: 50rem;
  }
  @media screen and (min-width: 1400px) {
    grid-template-columns: 1fr 1fr 1fr;
    max-width: 80rem;
  }
`;
