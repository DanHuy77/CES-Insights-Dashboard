
import {Error403Img} from '../../images/errors';

export const ErrorPage = ({ code = 403, children }:{ code?: number, children: any }) => (
  <div className="error-page">
    <div className="item">
      <img src={Error403Img} />
      <div className="text">
        <h1 className="error-page-code">{code}</h1>
        {children}
      </div>
    </div>
  </div>
);

