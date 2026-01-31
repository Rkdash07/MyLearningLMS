import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page">
      <h1>404 - Page not found</h1>
      <p className="muted">
        The page you are looking for doesn&apos;t exist or you don&apos;t have
        access to it.
      </p>
      <Link className="btn-primary" to="/">
        Go back home
      </Link>
    </div>
  );
}

export default NotFoundPage;


