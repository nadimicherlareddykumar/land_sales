import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="page center">
      <p className="eyebrow">404</p>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
