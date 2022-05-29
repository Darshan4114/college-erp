export default function range(start, stop, step = 1) {
  return Array(stop - start)
    .fill(start)
    .map((x, y) => x + y * step);
}
