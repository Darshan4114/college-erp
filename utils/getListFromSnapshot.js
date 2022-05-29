export default function getListFromSnapshot(snapshot) {
  return [
    ...snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    }),
  ];
}
