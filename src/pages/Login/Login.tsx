import { forwardRef, useRef, useState} from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../provider/authProvider";
import {
  Container,
  Content,
  Form,
  ButtonToolbar,
  Button,
  Panel,
  FlexboxGrid,
  Message,
  Schema,
} from "rsuite";
import { b64_md5 } from "../../utils/GenerateHash";
import { useNavigate } from "react-router-dom";

const TextField = forwardRef(
  (
    { name, label, type }: { name: string; label: string; type: string },
    ref
  ) => {
    return (
      <Form.Group controlId={`${name}`} ref={ref}>
        <Form.ControlLabel>{label} </Form.ControlLabel>
        <Form.Control name={name} type={type} />
      </Form.Group>
    );
  }
);

const { StringType } = Schema.Types;

const model = Schema.Model({
  email: StringType()
    .isEmail("Please enter a valid email address.")
    .isRequired("This field is required."),
  password: StringType().isRequired("This field is required."),
});

export const Login = () => {
  const formRef = useRef<HTMLFormElement>();
  const navigate = useNavigate();
  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });
  const [isMessageWaring, setIsMessageWarning] = useState(false);
  const { setToken } = useAuth();
  const auth = getAuth();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (formRef.current && !formRef.current.check()) {
      return;
    }
    event.preventDefault();
    signInWithEmailAndPassword(auth, formValue.email, formValue.password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          setToken(JSON.stringify(b64_md5("kanban-chart")));
          navigate("/", { replace: true });
          setIsMessageWarning(false);
        }
      })
      .catch(() => {
        setIsMessageWarning(true);
      });
  };

  return (
    <div className="show-fake-browser login-page">
      <Container>
        <Content>
          <FlexboxGrid justify="center">
            <FlexboxGrid.Item colspan={12}>
              <Panel header={<h3>Login</h3>} bordered>
                {isMessageWaring && (
                  <Panel>
                    <Message showIcon type="warning">
                      Unrecognized username or password.
                    </Message>
                  </Panel>
                )}
                <Form
                  ref={formRef}
                  onChange={setFormValue}
                  formValue={formValue}
                  model={model}
                  fluid
                >
                  <TextField name="email" label="Email" type="email" />
                  <TextField name="password" label="Password" type="password" />
                  <ButtonToolbar style={{ marginBottom: "10px" }}>
                    <Button
                      type="submit"
                      appearance="primary"
                      onClick={handleSubmit}
                    >
                      Sign in
                    </Button>
                  </ButtonToolbar>
                </Form>
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
      </Container>
    </div>
  );
};
