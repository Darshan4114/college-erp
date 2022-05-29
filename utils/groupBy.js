export default function groupBy(ungroupedArr, field) {
  return ungroupedArr.reduce((acc, value) => {
    // Group initialization
    if (!acc[value[field]]) {
      acc[value[field]] = [];
    }
    // Grouping
    acc[value[field]].push(value);
    return acc;
  }, {});
}
