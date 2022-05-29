export default function AuthorizationForm({ user, ...props }) {
  return (
    <>
      <div className="group">
        <label htmlFor="isDriver">Is driver?</label>
        <input
          type="checkbox"
          name="isDriver"
          id="isDriver"
          checked={user.isDriver}
          onChange={(e) => console.log(e)}
        />
      </div>
      <div className="group">
        <label htmlFor="isAdmin">Is admin?</label>
        <input
          type="checkbox"
          name="isAdmin"
          id="isAdmin"
          checked={user.isAdmin}
          onChange={(e) => console.log(e)}
        />
      </div>
    </>
  );
}
