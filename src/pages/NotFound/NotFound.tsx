
import { ErrorPage } from "../../components/ErrorPage";
import { Link } from "react-router-dom";
export const NotFound = () => {
  return (
    <ErrorPage code={404}>
      <p className="error-page-title">Oops… You just found an error page</p>
      <p className="error-page-subtitle text-muted ">
        We are sorry but the page you are looking for was not found
      </p>
      <Link to="/">Back to home</Link>
    </ErrorPage>
  );
};
