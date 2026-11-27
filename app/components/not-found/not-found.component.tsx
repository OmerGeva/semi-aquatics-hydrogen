import { Link } from 'react-router';

// Shown inside the normal site layout for any URL the site does not have.
const NotFound: React.FC = () => (
  <div style={{textAlign: 'center', padding: '50px'}}>
    <h1>Page Not Found.</h1>
    <Link to="/shop" style={{textDecoration: 'underline'}}>
      Go to the shop
    </Link>
  </div>
);

export default NotFound;
